import { test, expect } from '../../support/fixtures';

test.describe('extension', () => {
    test('is installed and its service worker is running', async ({ extension }, testInfo) => {
        testInfo.annotations.push({ type: 'extension', description: `${extension.target}: ${extension.id} v${extension.version}` });

        expect(extension.version).toMatch(/^\d+\.\d+\.\d+/);
        expect(await extension.worker.evaluate(() => chrome.runtime.id)).toBe(extension.id);
    });

    test('opens the settings page', async ({ openSettings }) => {
        const page = await openSettings();

        await expect(page.locator('app-sidebar')).toBeVisible();
        await expect(page.locator('app-sidebar-item')).not.toHaveCount(0);
    });
});
