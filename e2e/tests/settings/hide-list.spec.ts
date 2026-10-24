import { test, expect } from '../../support/fixtures';
import { hideList, KEYS } from '../../support/storage-data';
import { gotoSettings, HIDE_LIST_GROUPS, HIDE_LIST_OPTIONS, hideListOption } from '../../support/settings-page';

/* ST-HL-*: hide-list options on the settings page. Effect on YouTube: e2e/tests/mocked/settings-to-youtube.spec.ts */
test.describe('settings: hide list', () => {
    const storedMap = async (storage: { get(): Promise<Record<string, unknown>> }) =>
        Object.fromEntries((await storage.get())[KEYS.hideList] as [number, boolean][] ?? []);

    test('ST-HL-01 shows all groups and options with the stored state', async ({ page, extension, storage }) => {
        await storage.reset(hideList({ generalHideShorts: true, headerNotificationsBell: true }));
        await gotoSettings(page, extension.origin, 'hidelist');

        await expect(page.locator('app-hide-list-block')).toHaveCount(HIDE_LIST_GROUPS);
        await expect(page.locator('app-hide-list-block-item')).toHaveCount(HIDE_LIST_OPTIONS.length);

        for (const option of HIDE_LIST_OPTIONS) {
            const expected = option.type === 18 || option.type === 3;
            await expect(hideListOption(page, option.type).input, option.name).toBeChecked({ checked: expected });
        }
    });

    test('ST-HL-02 turning an option on is stored', async ({ page, extension, storage }) => {
        await storage.reset(hideList({ generalHideShorts: true }));
        await gotoSettings(page, extension.origin, 'hidelist');

        await hideListOption(page, 5).switch.click(); // Comments Section

        await expect.poll(async () => (await storedMap(storage))[5]).toBe(true);
        expect((await storedMap(storage))[18]).toBe(true);
    });

    test('ST-HL-03 turning an option off is stored', async ({ page, extension, storage }) => {
        await storage.reset(hideList({ generalHideShorts: true }));
        await gotoSettings(page, extension.origin, 'hidelist');

        await hideListOption(page, 18).switch.click(); // Hide Shorts

        await expect.poll(async () => (await storedMap(storage))[18]).toBe(false);
        await expect(hideListOption(page, 18).input).not.toBeChecked();
    });

    test('ST-HL-04 obsolete options are not shown', async ({ page, extension, storage }) => {
        // 2, 11, 12, 16, 17 are obsolete types that old installs may still have stored
        await storage.reset({ [KEYS.hideList]: [[2, true], [11, true], [12, true], [16, true], [17, true], [18, true]] });
        await gotoSettings(page, extension.origin, 'hidelist');

        await expect(page.locator('app-hide-list-block-item')).toHaveCount(HIDE_LIST_OPTIONS.length);
        await expect(hideListOption(page, 18).input).toBeChecked();
    });

    test('ST-HL-E02 toggling quickly keeps the last state', async ({ page, extension, storage }) => {
        await storage.reset(hideList({}));
        await gotoSettings(page, extension.origin, 'hidelist');
        const option = hideListOption(page, 4); // Up-Next Sidebar

        for (let i = 0; i < 5; i++) {
            await option.switch.click();
        }

        await expect(option.input).toBeChecked();
        await expect.poll(async () => (await storedMap(storage))[4]).toBe(true);
    });
});
