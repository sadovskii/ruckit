// Opens the HTML report of an e2e run.
//
//   node e2e/scripts/show-report.mjs                 the newest run
//   node e2e/scripts/show-report.mjs <run folder>    a run from e2e/runs (see e2e/runs/history.log)

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const runsDir = path.join(root, 'e2e', 'runs');
const hasReport = run => fs.existsSync(path.join(runsDir, run, 'report', 'index.html'));

const runs = fs.existsSync(runsDir)
    ? fs.readdirSync(runsDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).filter(hasReport).sort()
    : [];

const requested = process.argv[2];
const run = requested ? path.basename(requested.replace(/[\\/]report[\\/]?$/, '')) : runs.at(-1);

if (!run || !hasReport(run)) {
    console.error(requested
        ? `No report for "${requested}". Runs with a report:\n  ${runs.join('\n  ') || '(none)'}`
        : 'No e2e runs yet. Run e.g. "npm run e2e:local:chrome" first.');
    process.exit(1);
}

console.log(`Report of the run ${run}${run === runs.at(-1) ? ' (newest)' : ''}. Press Ctrl+C to stop the report server.`);

const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
spawn(process.execPath, [cli, 'show-report', path.join(runsDir, run, 'report')], { stdio: 'inherit' })
    .on('exit', code => process.exit(code ?? 0));
