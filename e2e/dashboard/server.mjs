// Local dashboard for the e2e tests: open the test windows, run tests, watch the output, open reports.
// Start it by double-clicking e2e/dashboard.cmd (or "npm run e2e:dashboard"); it opens http://localhost:9300.
// It only listens on 127.0.0.1, so it is reachable from this PC only.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dashboardDir = path.join(root, 'e2e', 'dashboard');
const runsDir = path.join(root, 'e2e', 'runs');
const playwrightCli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const targets = JSON.parse(fs.readFileSync(path.join(root, 'e2e', 'targets.json'), 'utf8'));

const PORT = Number(process.env.E2E_DASHBOARD_PORT ?? 9300);
const URL_BASE = `http://localhost:${PORT}`;
const MAX_LOG = 2_000_000;

/** Test groups that can be run separately; paths are relative to e2e/. */
const SUITES = {
    youtube: { title: 'YouTube page tests', paths: ['tests/youtube'] },
    settings: { title: 'settings page tests', paths: ['tests/settings'] },
    all: { title: 'all tests', paths: [] },
};

/** The single job that can run at a time (tests in one window must not overlap). */
let job;

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, URL_BASE);

        if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
            return sendFile(response, path.join(dashboardDir, 'index.html'));
        }
        if (request.method === 'GET' && url.pathname === '/api/state') {
            return sendJson(response, await getState());
        }
        if (request.method === 'GET' && url.pathname === '/api/job') {
            return sendJson(response, jobInfo(Number(url.searchParams.get('from') ?? 0)));
        }
        if (request.method === 'GET' && url.pathname.startsWith('/runs/')) {
            return sendFile(response, safeJoin(runsDir, decodeURIComponent(url.pathname.slice('/runs/'.length))));
        }

        if (request.method === 'POST') {
            // a custom header can't be sent by other websites without a CORS preflight, which this server never allows
            if (request.headers['x-ruckit-dashboard'] !== '1') {
                return sendJson(response, { error: 'forbidden' }, 403);
            }

            const body = await readJson(request);

            if (url.pathname === '/api/open') return sendJson(response, await openWindow(body.target));
            if (url.pathname === '/api/install') return sendJson(response, await openStorePage(body.target));
            if (url.pathname === '/api/run') return sendJson(response, await startRun(body));
            if (url.pathname === '/api/stop') return sendJson(response, stopJob());
        }

        sendJson(response, { error: 'not found' }, 404);
    }
    catch (error) {
        sendJson(response, { error: String(error?.message ?? error) }, 500);
    }
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.log(`The dashboard is already running: ${URL_BASE}`);
        if (process.argv.includes('--open')) openInBrowser(URL_BASE);
        process.exit(0);
    }
    throw error;
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Ruckit e2e dashboard: ${URL_BASE}  (close this window to stop it)`);
    if (process.argv.includes('--open')) openInBrowser(URL_BASE);
});

// ---------- state ----------

async function getState() {
    const windows = await Promise.all(Object.entries(targets).filter(([, target]) => target.port).map(async ([name, target]) => ({
        name,
        port: target.port,
        browser: await browserVersion(target.port),
        // store-version windows: is Ruckit installed there?
        storeExtension: target.extensionId ? { version: storeExtensionVersion(target), storeUrl: target.storeUrl } : undefined,
    })));

    return {
        windows: Object.fromEntries(windows.map(window => [window.name, window])),
        job: job ? jobInfo(Number.MAX_SAFE_INTEGER) : undefined,
        runs: listRuns(),
    };
}

async function browserVersion(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(800) });
        return response.ok ? (await response.json()).Browser : undefined;
    }
    catch {
        return undefined;
    }
}

/** Version of the store extension in the window's profile (<profile>/Default/Extensions/<id>/<version>_0), or undefined. */
function storeExtensionVersion(target) {
    const dir = path.join(root, target.profileDir, 'Default', 'Extensions', target.extensionId);
    const versions = fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => fs.existsSync(path.join(dir, name, 'manifest.json'))) : [];

    return versions.sort().at(-1)?.replace(/_\d+$/, '');
}

function listRuns() {
    if (!fs.existsSync(runsDir)) return [];

    return fs.readdirSync(runsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort()
        .reverse()
        .slice(0, 30)
        .map(folder => {
            const summaryFile = path.join(runsDir, folder, 'summary.json');
            const summary = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, 'utf8')) : undefined;
            const hasReport = fs.existsSync(path.join(runsDir, folder, 'report', 'index.html'));
            const hasLog = fs.existsSync(path.join(runsDir, folder, 'output.log'));

            return { folder, summary, report: hasReport ? `/runs/${folder}/report/index.html` : undefined, log: hasLog ? `/runs/${folder}/output.log` : undefined };
        });
}

// ---------- actions ----------

function openWindow(targetName) {
    if (!targets[targetName]?.port) throw new Error(`unknown window "${targetName}"`);

    return new Promise(resolve => {
        const child = spawn(process.execPath, [path.join(root, 'e2e', 'scripts', 'open-browser.mjs'), targetName], { cwd: root });
        let output = '';
        child.stdout.on('data', chunk => output += chunk);
        child.stderr.on('data', chunk => output += chunk);
        child.on('close', code => resolve({ ok: code === 0, output: output.trim() }));
    });
}

/** Opens the extension's store page as a new tab in the (open) store-version window. */
async function openStorePage(targetName) {
    const target = targets[targetName];
    if (!target?.storeUrl) throw new Error(`"${targetName}" has no store page`);
    if (!await browserVersion(target.port)) throw new Error(`The ${targetName} window is not open. Press "Open window" first.`);

    // DevTools HTTP endpoint: opens a new tab with the URL
    const response = await fetch(`http://127.0.0.1:${target.port}/json/new?${encodeURI(target.storeUrl)}`, { method: 'PUT' });

    return response.ok
        ? { ok: true, output: `Opened the store page in the ${targetName} window. Press "Add to Chrome" / "Get" there; the card updates by itself.` }
        : { ok: false, output: `Could not open the store page (HTTP ${response.status}). Open ${target.storeUrl} in that window.` };
}

/** Problems that would make every test of the run fail; checked before starting it. */
async function preflight(targetName, target) {
    if (!target.port) return undefined;

    if (!await browserVersion(target.port)) {
        return `The ${targetName} window is not open. Press "Open window" on its card first.`;
    }

    if (target.extensionId && !storeExtensionVersion(target)) {
        return `Ruckit is not installed in the ${targetName} window. Press "Install Ruckit" on its card, install it from the store, then run again.`;
    }

    return undefined;
}

async function startRun({ target: targetName, suite = 'all', build = true }) {
    const target = targets[targetName];
    const suiteConfig = SUITES[suite];

    if (!target || !suiteConfig) throw new Error(`unknown target "${targetName}" or suite "${suite}"`);
    if (job?.status === 'running') throw new Error('Tests are already running. Wait or press Stop.');

    const problem = await preflight(targetName, target);
    if (problem) throw new Error(problem);

    const label = `${targetName}: ${suiteConfig.title}`;
    const steps = [];

    if (build && target.buildScript) {
        steps.push({ title: `npm run ${target.buildScript}`, command: `npm run ${target.buildScript}`, shell: true });
    }

    steps.push({
        title: `playwright test --project=${targetName} ${suiteConfig.paths.join(' ')}`.trim(),
        command: process.execPath,
        args: [playwrightCli, 'test', '-c', 'e2e', `--project=${targetName}`, ...suiteConfig.paths.map(testPath => `e2e/${testPath}`)],
        env: { E2E_RUN_LABEL: label },
    });

    job = { id: Date.now(), label, status: 'running', startedAt: new Date().toISOString(), log: '', child: undefined, stopped: false, report: undefined };
    runSteps(job, steps);

    return { ok: true, id: job.id };
}

async function runSteps(currentJob, steps) {
    for (const step of steps) {
        append(currentJob, `\n> ${step.title}\n\n`);

        const code = await new Promise(resolve => {
            const child = spawn(step.command, step.args ?? [], {
                cwd: root,
                shell: step.shell ?? false,
                env: { ...process.env, FORCE_COLOR: '0', CI: '', ...step.env },
            });
            currentJob.child = child;
            child.stdout.on('data', chunk => append(currentJob, chunk));
            child.stderr.on('data', chunk => append(currentJob, chunk));
            child.on('error', error => append(currentJob, `\n${error.message}\n`));
            child.on('close', resolve);
        });

        currentJob.child = undefined;

        if (currentJob.stopped) {
            currentJob.status = 'stopped';
            break;
        }

        if (code !== 0) {
            currentJob.status = 'failed';
            break;
        }
    }

    if (currentJob.status === 'running') currentJob.status = 'passed';

    const reportMatch = currentJob.log.match(/Report of this run: (\S+)/);
    if (reportMatch) {
        const folder = path.basename(path.dirname(reportMatch[1]));
        currentJob.report = `/runs/${folder}/report/index.html`;
    }

    append(currentJob, `\n--- ${currentJob.status.toUpperCase()} ---\n`);
}

function stopJob() {
    if (job?.status !== 'running' || !job.child) return { ok: false };

    job.stopped = true;

    // the job runs node/npm with child processes (browsers attached to your windows are only disconnected)
    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(job.child.pid), '/T', '/F']);
    }
    else {
        job.child.kill('SIGTERM');
    }

    return { ok: true };
}

function append(currentJob, chunk) {
    // no colors in the page
    currentJob.log += String(chunk).replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');

    if (currentJob.log.length > MAX_LOG) {
        currentJob.log = currentJob.log.slice(-MAX_LOG);
    }
}

function jobInfo(from) {
    if (!job) return { job: undefined };

    const { child, stopped, ...info } = job;

    return { ...info, log: from >= job.log.length ? '' : job.log.slice(from), logLength: job.log.length };
}

// ---------- http helpers ----------

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webm': 'video/webm',
    '.zip': 'application/zip', '.md': 'text/plain; charset=utf-8', '.log': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

function sendFile(response, file) {
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        return sendJson(response, { error: 'not found' }, 404);
    }

    response.writeHead(200, { 'Content-Type': CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(response);
}

function sendJson(response, data, status = 200) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(data));
}

function safeJoin(base, relative) {
    const resolved = path.resolve(base, relative);

    return resolved.startsWith(base + path.sep) ? resolved : undefined;
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let data = '';
        request.on('data', chunk => {
            data += chunk;
            if (data.length > 100_000) reject(new Error('request too large'));
        });
        request.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch (error) { reject(error); }
        });
    });
}

function openInBrowser(url) {
    const [command, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
        : process.platform === 'darwin' ? ['open', [url]]
        : ['xdg-open', [url]];

    spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
}
