// Opens the browser window that the e2e tests attach to, with a dedicated profile in e2e/.profiles/<target>
// and a DevTools port. The window is started normally (not by an automation tool), so Google lets you sign in.
// Sign in once and keep the window open; tests open and close their own tabs in it.
// If the window is already open, nothing happens.
//
// Usage: node e2e/scripts/open-browser.mjs <local-chrome|local-edge|prod-chrome|prod-edge>
// Override the browser location with CHROME_PATH / EDGE_PATH if it isn't found.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const targets = JSON.parse(fs.readFileSync(path.join(root, 'e2e', 'targets.json'), 'utf8'));
const windowTargets = Object.keys(targets).filter(name => targets[name].port);

const targetName = process.argv[2];
const target = targets[targetName];

if (!target?.port) {
    console.error(`Usage: node e2e/scripts/open-browser.mjs <${windowTargets.join('|')}>`);
    process.exit(1);
}

const endpoint = `http://127.0.0.1:${target.port}/json/version`;

if (await isUp()) {
    console.log(`The ${targetName} window is already open (port ${target.port}).`);
    process.exit(0);
}

const candidates = {
    chrome: [
        process.env.CHROME_PATH,
        path.join(process.env.PROGRAMFILES ?? '', 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
    ],
    edge: [
        process.env.EDGE_PATH,
        path.join(process.env['PROGRAMFILES(X86)'] ?? '', 'Microsoft/Edge/Application/msedge.exe'),
        path.join(process.env.PROGRAMFILES ?? '', 'Microsoft/Edge/Application/msedge.exe'),
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/usr/bin/microsoft-edge',
    ],
};

const executable = candidates[target.browser].find(candidate => candidate && fs.existsSync(candidate));

if (!executable) {
    console.error(`Could not find ${target.browser}. Set ${target.browser === 'chrome' ? 'CHROME_PATH' : 'EDGE_PATH'} to its executable.`);
    process.exit(1);
}

const profileDir = path.join(root, target.profileDir);
const firstTime = !fs.existsSync(profileDir);
fs.mkdirSync(profileDir, { recursive: true });

const isProd = Boolean(target.extensionId);
const startPages = firstTime
    ? ['https://accounts.google.com/ServiceLogin?continue=https://www.youtube.com/', ...(isProd ? [target.storeUrl] : [])]
    : ['https://www.youtube.com/'];

spawn(executable, [
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${target.port}`,
    // lets the tests load the local build into this window (Chrome ignores --load-extension since v137)
    ...(isProd ? [] : ['--enable-unsafe-extension-debugging']),
    // keep rendering while the window is covered by other windows or minimized: YouTube loads its feed only when it renders
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    '--disable-features=CalculateNativeWinOcclusion',
    // no browser sync: tests change the extension's chrome.storage.sync, which must not reach (or come from)
    // your real browsers; the local build has the same extension ID as the store version
    '--disable-sync',
    '--no-first-run',
    '--no-default-browser-check',
    ...startPages,
], { detached: true, stdio: 'ignore' }).unref();

for (let attempt = 0; attempt < 40 && !(await isUp()); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 500));
}

if (!(await isUp())) {
    console.error(`The ${targetName} window did not open its DevTools port ${target.port}. Is another program using that port?`);
    process.exit(1);
}

console.log(`Opened the ${targetName} window (${target.browser}, profile ${target.profileDir}, port ${target.port}).`);

if (firstTime) {
    const steps = [
        `Sign in on the Google tab${isProd ? ' with the TEST account' : ''}; you'll land on youtube.com.`,
        'Decline "Turn on sync" - only the web sign-in is needed.',
        isProd
            ? 'Install Ruckit from the store tab.'
            : 'Do NOT install Ruckit from the store here - the tests load your build from dist/ into this window.',
        'Accept YouTube\'s cookie dialog if it appears.',
        'Keep this window open (minimizing is fine). If you close it, run this command again - the login is kept.',
    ];

    console.log(`\nOne-time setup in that window:\n${steps.map((step, index) => `  ${index + 1}. ${step}`).join('\n')}`);
}

async function isUp() {
    try {
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(1_000) });
        return response.ok;
    }
    catch {
        return false;
    }
}
