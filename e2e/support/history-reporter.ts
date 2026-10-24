import fs from 'node:fs';
import path from 'node:path';
import type { FullResult, Reporter, Suite } from '@playwright/test/reporter';

/*
 * Appends one line per run to e2e/runs/history.log: date, status, projects, counts, duration and where the
 * HTML report is, followed by the failed tests. Keeps the newest `keep` run folders in e2e/runs.
 */

interface Options {
    runsDir: string;
    reportDir: string;
    keep: number;
}

const ROOT = path.resolve(__dirname, '..', '..');

class HistoryReporter implements Reporter {
    private suite?: Suite;
    private nothingRan = false;
    private readonly startedAt = new Date();

    constructor(private readonly options: Options) {}

    printsToStdio(): boolean {
        return false;
    }

    // called after every reporter (including the HTML one) has finished writing
    async onExit(): Promise<void> {
        const runDir = path.dirname(this.options.reportDir);

        if (this.nothingRan && path.dirname(runDir) === this.options.runsDir) {
            fs.rmSync(runDir, { recursive: true, force: true });
        }
    }

    onBegin(_config: unknown, suite: Suite): void {
        this.suite = suite;
    }

    onEnd(result: FullResult): void {
        const tests = this.suite?.allTests() ?? [];

        // nothing ran (e.g. "--list"): the empty run folder is removed in onExit
        if (!tests.some(test => test.results.length > 0)) {
            this.nothingRan = true;
            return;
        }

        const count = (outcome: string) => tests.filter(test => test.outcome() === outcome).length;
        const projects = [...new Set(tests.map(test => test.parent.project()?.name ?? '?'))];
        const failedTests = tests
            .filter(test => test.outcome() === 'unexpected')
            .map(test => `[${test.parent.project()?.name}] ${test.titlePath().slice(3).join(' > ')}`);
        const failed = failedTests.map(title => `    x ${title}`);
        const counts = { passed: count('expected'), failed: count('unexpected'), flaky: count('flaky'), skipped: count('skipped') };
        const label = process.env['E2E_RUN_LABEL'] ?? '';

        const reportDir = path.relative(ROOT, this.options.reportDir);
        const line = [
            formatDate(this.startedAt),
            result.status.toUpperCase().padEnd(11),
            `[${projects.join(', ')}]${label ? ` ${label}` : ''}`,
            `${counts.passed} passed, ${counts.failed} failed, ${counts.flaky} flaky, ${counts.skipped} skipped`,
            `${Math.round(result.duration / 1000)}s`,
            `report: ${reportDir}`,
        ].join('  ');

        fs.mkdirSync(this.options.runsDir, { recursive: true });
        fs.appendFileSync(path.join(this.options.runsDir, 'history.log'), [line, ...failed].join('\n') + '\n');

        // read by the dashboard (e2e/dashboard)
        const runDir = path.dirname(this.options.reportDir);
        fs.mkdirSync(runDir, { recursive: true });
        fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify({
            startedAt: this.startedAt.toISOString(),
            status: result.status,
            label,
            projects,
            counts,
            durationSeconds: Math.round(result.duration / 1000),
            failedTests,
        }, null, 2));

        this.removeOldRuns();

        process.stdout.write(`\nReport of this run: ${reportDir}  (open it in the dashboard or with "npm run e2e:report")\n`);
    }

    private removeOldRuns(): void {
        const runs = fs.readdirSync(this.options.runsDir, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
            .sort();

        for (const old of runs.slice(0, Math.max(0, runs.length - this.options.keep))) {
            fs.rmSync(path.join(this.options.runsDir, old), { recursive: true, force: true });
        }
    }
}

function formatDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default HistoryReporter;
