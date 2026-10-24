import { test, expect } from '../../support/fixtures';
import { gotoSettings, openSection, section, selectOptions } from '../../support/settings-page';

/* ST-AP-*: theme (Settings → Appearance). See e2e/docs/settings-page.md */
const THEME = 'theme';

test.describe('settings: appearance', () => {
    test('ST-AP-02 without a stored theme the light theme is used', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);

        await expect(page.locator('body')).toHaveClass(/nb-theme-default/);
    });

    test('ST-AP-01 choosing Dark applies it at once and keeps it for the next visit', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'settings');

        await section(page, 'settings').locator('nb-select').click();
        await selectOptions(page).nth(1).click();

        await expect(page.locator('body')).toHaveClass(/nb-theme-dark/);
        await expect.poll(async () => (await storage.get())[THEME]).toBe('dark');

        await gotoSettings(page, extension.origin);
        await expect(page.locator('body')).toHaveClass(/nb-theme-dark/);
    });

    test('ST-AP-01 choosing Light again switches back', async ({ page, extension, storage }) => {
        await storage.reset({ [THEME]: 'dark' });
        await gotoSettings(page, extension.origin);
        await expect(page.locator('body')).toHaveClass(/nb-theme-dark/);
        await openSection(page, 'settings');

        await section(page, 'settings').locator('nb-select').click();
        await selectOptions(page).nth(0).click();

        await expect(page.locator('body')).toHaveClass(/nb-theme-default/);
        await expect.poll(async () => (await storage.get())[THEME]).toBe('default');
    });
});
