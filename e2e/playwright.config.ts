import { defineConfig, type PlaywrightTestOptions, type PlaywrightWorkerOptions, type Project } from '@playwright/test';
import path from 'node:path';
import type { TargetName } from './support/targets';

/*
 * Every run gets its own folder e2e/runs/<date-time> with the HTML report and the failure screenshots/traces;
 * e2e/runs/history.log lists all runs. The folder name is chosen once in the main process and passed to the
 * worker processes (which load this config again) through the environment.
 */
const RUNS_DIR = path.join(__dirname, 'runs');
process.env['E2E_RUN_DIR'] ??= path.join(RUNS_DIR, localTimestamp());
const RUN_DIR = process.env['E2E_RUN_DIR'];
const REPORT_DIR = process.env['E2E_REPORT_DIR'] ?? path.join(RUN_DIR, 'report');

/*
 * Projects (see e2e/README.md):
 *   local-chrome / local-edge - the local build (dist/chrome, dist/edge) on the real youtube.com.
 *   prod-chrome / prod-edge   - the extension installed from the store on the real youtube.com (daily run).
 *   These four attach to browser windows opened with "npm run e2e:open:<project>", where you signed in once.
 *   mocked                    - dist/chrome in Playwright's own Chromium against a fake, offline YouTube.
 */
const realYouTube = (target: TargetName): Project<PlaywrightTestOptions, PlaywrightWorkerOptions & { target: TargetName }> => ({
    name: target,
    testMatch: ['settings/**/*.spec.ts', 'youtube/**/*.spec.ts'],
    // one test at a time in each window
    workers: 1,
    // the real YouTube is sometimes slow or shows a different layout variant
    retries: 1,
    use: { target },
});

export default defineConfig<{}, { target: TargetName }>({
    testDir: './tests',
    outputDir: process.env['E2E_RESULTS_DIR'] ?? path.join(RUN_DIR, 'test-results'),
    timeout: 120_000,
    expect: { timeout: 15_000 },
    reporter: [
        ['list'],
        ['html', { outputFolder: REPORT_DIR, open: 'never' }],
        ['./support/history-reporter.ts', { runsDir: RUNS_DIR, reportDir: REPORT_DIR, keep: 30 }],
    ],
    use: {
        viewport: { width: 1400, height: 900 },
    },
    projects: [
        realYouTube('local-chrome'),
        realYouTube('local-edge'),
        realYouTube('prod-chrome'),
        realYouTube('prod-edge'),
        {
            name: 'mocked',
            testMatch: ['settings/**/*.spec.ts', 'mocked/**/*.spec.ts'],
            use: { target: 'mocked', headless: true },
        },
    ],
});

function localTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}
