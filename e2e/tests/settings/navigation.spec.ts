import { test, expect } from '../../support/fixtures';
import { TARGETS } from '../../support/targets';
import { gotoSettings, openSection, section, sidebarItem, type Section } from '../../support/settings-page';

/* ST-NAV-*: settings page shell, sidebar, ?action= deep links, start page, external links. See e2e/docs/settings-page.md */
test.describe('settings: navigation', () => {
    test('ST-NAV-01 opens on the start page with the sidebar', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);

        await expect(section(page, 'home')).toBeVisible();
        await expect(page.locator('app-sidebar app-sidebar-item')).toHaveCount(7);
    });

    for (const name of ['about', 'blacklist', 'hidelist', 'password', 'settings'] as const) {
        test(`ST-NAV-02 sidebar opens "${name}" and highlights it`, async ({ page, extension }) => {
            await gotoSettings(page, extension.origin);

            await openSection(page, name);

            await expect(sidebarItem(page, name).locator('.sidebar-item_active')).toBeVisible();
            await expect(page.locator('app-sidebar .sidebar-item_active')).toHaveCount(1);
        });
    }

    test('ST-NAV-02 the logo opens the start page', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);
        await openSection(page, 'about');

        // the logo picture is an <object>, which swallows clicks; the brand name next to it doesn't
        await page.locator('app-sidebar-header .app-name').click();

        await expect(section(page, 'home')).toBeVisible();
        await expect(page.locator('app-sidebar .sidebar-item_active')).toHaveCount(0);
    });

    const deepLinks: [string, Section][] = [['blacklist', 'blacklist'], ['hidelist', 'hidelist'], ['settings', 'settings'], ['home', 'home']];
    for (const [action, expected] of deepLinks) {
        test(`ST-NAV-03 ?action=${action} opens "${expected}" and is removed from the URL`, async ({ page, extension }) => {
            await gotoSettings(page, extension.origin, action);

            await expect(section(page, expected)).toBeVisible();
            await expect(page).not.toHaveURL(/action=/);
        });
    }

    test('ST-NAV-04 an unknown ?action= opens the start page', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin, 'something-else');

        await expect(section(page, 'home')).toBeVisible();
    });

    test('ST-NAV-05 start page shows a demon picture and the quote', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);

        await expect(section(page, 'home').locator('object')).toHaveAttribute('data', /assets\/demons\/demon-[\w-]+\.svg$/);
        await expect(section(page, 'home').locator('.quote')).toBeVisible();
    });

    test('ST-NAV-07 "Support Ruckit" opens the donation page in a new tab', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);

        const popupPromise = page.waitForEvent('popup');
        await sidebarItem(page, 'support').click();
        const popup = await popupPromise;

        await expect(popup).toHaveURL(/^https:\/\/donate\.stripe\.com\//);
    });

    test('ST-NAV-08 "Give feedback" opens the review page of this browser\'s store', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);
        const expected = TARGETS[extension.target].channel === 'msedge'
            ? /^https:\/\/microsoftedge\.microsoft\.com\/addons\/detail\/jlcgbbelbhaedigmbedelliiogfobpco/
            : /^https:\/\/chromewebstore\.google\.com\/detail\/[^/]+\/eakiedfceboebghgkpciddfaghpednlb\/reviews/;

        const popupPromise = page.waitForEvent('popup');
        await sidebarItem(page, 'feedback').click();
        const popup = await popupPromise;

        await expect(popup).toHaveURL(expected);
    });
});
