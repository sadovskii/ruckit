import { test as base, expect, chromium, type Browser, type BrowserContext, type Page, type Worker } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TARGETS, type Target, type TargetName } from './targets';
import { KEYS, type StoredData } from './storage-data';
import { YouTubeMock } from './youtube-mock';

const ROOT = path.resolve(__dirname, '..', '..');
const WORKER_START_TIMEOUT = 30_000;

export interface ExtensionHandle {
    target: TargetName;
    id: string;
    version: string;
    context: BrowserContext;
    /** Base URL of extension pages, e.g. chrome-extension://<id> */
    origin: string;
    /** The extension service worker (the same object survives MV3 idle suspension). */
    worker: Worker;
    /** true when the tests are attached to a window you opened (and signed in to) yourself. */
    attached: boolean;
}

export class ExtensionStorage {
    constructor(private readonly extension: ExtensionHandle) {}

    get(): Promise<StoredData> {
        return this.extension.worker.evaluate(() => chrome.storage.sync.get(null));
    }

    async set(data: StoredData): Promise<void> {
        await withQuotaRetry(() => this.extension.worker.evaluate(items => chrome.storage.sync.set(items), data));
    }

    /**
     * Replaces the whole storage content. chrome.storage.sync allows only 120 writes per minute (1800 per hour),
     * so nothing is written when the content is already right, and one write is used where one is enough.
     */
    async reset(data: StoredData = {}): Promise<void> {
        const current = await this.get();
        const removedKeys = Object.keys(current).filter(key => !(key in data));
        const changed = Object.fromEntries(Object.entries(data).filter(([key, value]) => JSON.stringify(current[key]) !== JSON.stringify(value)));

        if (removedKeys.length === 0 && Object.keys(changed).length === 0) return;

        await withQuotaRetry(() => this.extension.worker.evaluate(async ({ removedKeys, changed }) => {
            if (removedKeys.length) await chrome.storage.sync.remove(removedKeys);
            if (Object.keys(changed).length) await chrome.storage.sync.set(changed);
        }, { removedKeys, changed }));
    }
}

/** Waits for chrome.storage.sync's per-minute write quota instead of failing the test. */
async function withQuotaRetry<T>(write: () => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
        try {
            return await write();
        }
        catch (error) {
            if (!String(error).includes('MAX_WRITE_OPERATIONS_PER_MINUTE') || attempt > 12) throw error;
            await new Promise(resolve => setTimeout(resolve, 5_000));
        }
    }
}

interface WorkerFixtures {
    target: TargetName;
    extension: ExtensionHandle;
}

interface TestFixtures {
    page: Page;
    storage: ExtensionStorage;
    youtube: YouTubeMock;
    /** Opens the extension settings page (index.html in a tab renders the full settings UI). */
    openSettings: () => Promise<Page>;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
    target: ['local-chrome', { option: true, scope: 'worker' }],

    extension: [async ({ target, headless }, use, workerInfo) => {
        const config = TARGETS[target];
        const connection = config.port
            ? await attachToOpenWindow(target, config)
            : await launchTemporaryBrowser(target, config, headless);

        console.log(`e2e [${workerInfo.project.name}]: ${connection.extension.attached ? 'attached to the open window' : 'temporary browser'}, extension ${connection.extension.id} v${connection.extension.version}`);

        await use(connection.extension);

        await connection.close();
    }, { scope: 'worker', timeout: 120_000 }],

    // A new tab for every test. Only the tabs opened during the test are closed afterwards,
    // so your own tabs in an attached window stay untouched.
    page: async ({ extension }, use, testInfo) => {
        const before = new Set(extension.context.pages());
        const page = await extension.context.newPage();
        // a background tab isn't rendered, and YouTube only loads content it renders
        await page.bringToFront();

        await use(page);

        for (const openedPage of extension.context.pages()) {
            if (before.has(openedPage)) continue;

            if (testInfo.status !== testInfo.expectedStatus && !openedPage.isClosed()) {
                const screenshot = await openedPage.screenshot().catch(() => undefined);
                if (screenshot) {
                    await testInfo.attach(`page ${openedPage.url()}`, { body: screenshot, contentType: 'image/png' });
                }
            }

            await openedPage.close().catch(() => undefined);
        }
    },

    // Restores the storage after every test, so tests never leak settings into each other
    // (in production windows this is the test account's synced extension data).
    storage: async ({ extension }, use) => {
        const storage = new ExtensionStorage(extension);
        const snapshot = await storage.get();

        await use(storage);

        await storage.reset(snapshot);
    },

    youtube: async ({ extension }, use) => {
        const youtube = new YouTubeMock(extension.context);
        await youtube.start();

        await use(youtube);

        await youtube.stop();
    },

    openSettings: async ({ extension, page }, use) => {
        await use(async () => {
            await page.goto(`${extension.origin}/index.html`);
            await expect(page.locator('app-settings')).toBeVisible();

            return page;
        });
    },
});

export { expect };

interface Connection {
    extension: ExtensionHandle;
    close: () => Promise<void>;
}

/**
 * Attaches to the window opened by "npm run e2e:open:<target>" through its DevTools port. Google lets you sign in
 * there, because that window isn't started by an automation tool. For the local build, the unpacked dist folder is
 * (re)loaded into the window; for the store version, the installed extension is used. When the tests finish,
 * Playwright only disconnects: the window, your tabs and the login stay.
 */
async function attachToOpenWindow(target: TargetName, config: Target): Promise<Connection> {
    const openHint = `Run "npm run e2e:open:${target}" (sign in there once) and keep that window open.`;
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${config.port}`, { timeout: 10_000 }).catch(() => undefined);

    if (!browser) {
        throw new Error(`The ${target} test window is not open. ${openHint}`);
    }

    const disconnect = async () => { await browser.close().catch(() => undefined); };
    const fail = async (message: string): Promise<never> => {
        await disconnect();
        throw new Error(message);
    };

    const context = browser.contexts()[0] ?? await fail(`The ${target} window has no browser context. ${openHint}`);

    let extensionId = config.extensionId ?? '';

    if (config.extensionDir) {
        extensionId = await loadUnpacked(browser, config).catch(error => fail(String(error)));
    }
    else if (!storeExtensionVersion(config)) {
        // checked in the profile folder, so no time is lost waiting for a service worker that can't start
        await fail(`Ruckit is not installed in the ${target} window. Install it from the store (the dashboard's "Install Ruckit" button, or ${config.storeUrl}).`);
    }

    const worker = await waitForServiceWorker(context, extensionId) ?? await fail(config.extensionDir
        ? `The build "${config.extensionDir}" was loaded into the ${target} window but its service worker did not start.`
        : `Ruckit is installed in the ${target} window but doesn't run - is it turned off on the extensions page?`);

    if (config.extensionDir) {
        // a first load installs the extension, and background.ts then writes its defaults; let that finish before tests start
        await expect.poll(async () => KEYS.channelsOn in await worker.evaluate(() => chrome.storage.sync.get(null)), { timeout: 5_000 })
            .toBe(true).catch(() => undefined);
    }

    await disableOtherExtensions(context, extensionId);

    return { extension: await describeExtension(target, context, worker, true), close: disconnect };
}

/**
 * Version of the store extension installed in the window's profile (folder <profile>/Default/Extensions/<id>/<version>_0),
 * or undefined when it isn't installed.
 */
function storeExtensionVersion(config: Target): string | undefined {
    if (!config.profileDir || !config.extensionId) return undefined;

    const dir = path.join(ROOT, config.profileDir, 'Default', 'Extensions', config.extensionId);
    const versions = fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => fs.existsSync(path.join(dir, name, 'manifest.json'))) : [];

    return versions.sort().at(-1)?.replace(/_\d+$/, '');
}

/** Starts Playwright's own browser with a brand-new temporary profile (no account) and loads the unpacked build. */
async function launchTemporaryBrowser(target: TargetName, config: Target, headless: boolean): Promise<Connection> {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), `ruckit-e2e-${target}-`));
    const removeProfile = () => fs.rmSync(userDataDir, { recursive: true, force: true });

    const context = await chromium.launchPersistentContext(userDataDir, {
        channel: config.channel,
        headless,
        args: ['--enable-unsafe-extension-debugging', '--lang=en-US'],
        // Playwright disables extensions by default
        ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    });

    const close = async () => {
        await context.close();
        removeProfile();
    };
    const fail = async (message: string): Promise<never> => {
        await close();
        throw new Error(message);
    };

    const extensionId = await loadUnpacked(context.browser()!, config).catch(error => fail(String(error)));
    const worker = await waitForServiceWorker(context, extensionId)
        ?? await fail(`The build "${config.extensionDir}" was loaded into ${config.channel} but its service worker did not start.`);

    // background.ts sets defaults on install (channels on, hide shorts); wait for it so tests don't race with it.
    await expect.poll(async () => {
        const stored = await worker.evaluate(() => chrome.storage.sync.get(null));
        return KEYS.channelsOn in stored && KEYS.hideList in stored;
    }, { message: 'extension install defaults were not written', timeout: 15_000 }).toBe(true);

    // Closing the last tab would close the browser; this tab stays open until the worker ends.
    const keeper = context.pages()[0] ?? await context.newPage();
    await keeper.goto('about:blank');

    return { extension: await describeExtension(target, context, worker, false), close };
}

/**
 * Loads (or reloads) the unpacked build. Chrome ignores --load-extension since v137, so the DevTools
 * "Extensions.loadUnpacked" command is used; it needs the browser to run with --enable-unsafe-extension-debugging.
 */
async function loadUnpacked(browser: Browser, config: Target): Promise<string> {
    const extensionDir = path.join(ROOT, config.extensionDir!);

    if (!fs.existsSync(path.join(extensionDir, 'manifest.json'))) {
        throw new Error(`No extension build in "${config.extensionDir}". Run "npm run ${config.buildScript}" or "npm run e2e:local" (builds first).`);
    }

    const cdp = await browser.newBrowserCDPSession();

    try {
        // the "Extensions" CDP domain is newer than Playwright's protocol typings
        const result = await (cdp as unknown as { send(method: string, params: object): Promise<{ id: string }> })
            .send('Extensions.loadUnpacked', { path: extensionDir });

        return result.id;
    }
    catch (error) {
        throw new Error(`Could not load the build "${config.extensionDir}" into ${config.channel}: ${error}`);
    }
    finally {
        await cdp.detach().catch(() => undefined);
    }
}

/**
 * Other extensions in a test window (e.g. brought in by browser sync: ad blockers, other YouTube tools,
 * site blockers) would change YouTube pages and distort the results, so they are turned off in that profile.
 */
async function disableOtherExtensions(context: BrowserContext, keepId: string): Promise<void> {
    const page = await context.newPage();

    try {
        await page.goto('chrome://extensions');
        const disabled = await page.evaluate(async id => {
            const others = (await chrome.management.getAll()).filter(item => item.enabled && item.id !== id && item.mayDisable !== false);
            for (const other of others) {
                await chrome.management.setEnabled(other.id, false);
            }
            return others.map(other => other.name);
        }, keepId);

        if (disabled.length) {
            console.log(`e2e: turned off other extensions in the test window: ${disabled.join(', ')}`);
        }
    }
    finally {
        await page.close();
    }
}

async function describeExtension(target: TargetName, context: BrowserContext, worker: Worker, attached: boolean): Promise<ExtensionHandle> {
    const workerUrl = new URL(worker.url());
    const version = await worker.evaluate(() => chrome.runtime.getManifest().version);

    return {
        target,
        id: workerUrl.host,
        version,
        context,
        origin: `${workerUrl.protocol}//${workerUrl.host}`,
        worker,
        attached,
    };
}

/**
 * Returns a live service worker of the extension.
 * MV3 service workers only run on events, so if none is running a navigation is made to wake it up
 * (background.ts listens to tabs.onUpdated / webNavigation.onCommitted). When an extension is reloaded,
 * the previous worker object is dead, so every candidate is checked with a quick evaluate.
 */
async function waitForServiceWorker(context: BrowserContext, extensionId: string): Promise<Worker | undefined> {
    const matches = (worker: Worker) => worker.url().includes(`://${extensionId}/`);
    const deadline = Date.now() + WORKER_START_TIMEOUT;

    while (Date.now() < deadline) {
        const candidates = context.serviceWorkers().filter(matches).reverse();

        for (const candidate of candidates) {
            if (await isAlive(candidate)) return candidate;
        }

        const started = context.waitForEvent('serviceworker', { predicate: matches, timeout: 2_000 }).catch(() => undefined);

        const wakeUpPage = await context.newPage();
        await wakeUpPage.goto(`data:text/html,<title>wake up ${Date.now()}</title>`).catch(() => undefined);
        await wakeUpPage.close();

        const worker = await started;
        if (worker && await isAlive(worker)) return worker;
    }

    return undefined;
}

async function isAlive(worker: Worker): Promise<boolean> {
    const timeout = new Promise<boolean>(resolve => setTimeout(() => resolve(false), 3_000));
    const evaluation = worker.evaluate(() => true).catch(() => false);

    return Promise.race([evaluation, timeout]);
}
