import { test, expect } from '../../support/fixtures';
import { hideList, KEYS, keywordsOn, phrasesOn } from '../../support/storage-data';
import {
    addViaCard, blackListCard, enterPassword, gotoSettings, hideListOption, manageDialog, snackBar,
} from '../../support/settings-page';

/*
 * ST-LK-*: with a password set, changes that weaken restrictions (turning off, opening "Manage restrictions")
 * need the password; changes that make them stronger (turning on, adding) don't. See e2e/docs/settings-page.md
 */
const PASSWORD = 's3cret';
const locked = { password: PASSWORD, 'free-password-period': 30 };

test.describe('settings: password lock', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    test('ST-LK-01 turning a black-list toggle off is blocked', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const card = blackListCard(page, 'keywords');

        await card.toggle.switch.click();

        await expect(snackBar(page).root).toBeVisible();
        await expect(snackBar(page).actionButton).toBeVisible();
        await expect(card.toggle.input).toBeChecked();
        expect(await stored(storage, KEYS.keywordsOn)).toBe(true);
    });

    test('ST-LK-01 turning a hide-list option off is blocked', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...hideList({ generalHideShorts: true }) });
        await gotoSettings(page, extension.origin, 'hidelist');
        const option = hideListOption(page, 18);

        await option.switch.click();

        await expect(snackBar(page).root).toBeVisible();
        await expect(option.input).toBeChecked();
        expect(await stored(storage, KEYS.hideList)).toEqual([[18, true]]);
    });

    test('ST-LK-02 "Enter password" + the right password unlocks and applies the change', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const card = blackListCard(page, 'keywords');

        await card.toggle.switch.click();
        await snackBar(page).actionButton.click();
        await enterPassword(page, PASSWORD);

        await expect(card.toggle.input).not.toBeChecked();
        await expect.poll(() => stored(storage, KEYS.keywordsOn)).toBe(false);
        // unlocked: the next weakening change needs no password
        await expect(card.toggle.lockIcon).toHaveCount(0);
    });

    test('ST-LK-02 a wrong password keeps it locked', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const card = blackListCard(page, 'keywords');

        await card.toggle.switch.click();
        await snackBar(page).actionButton.click();
        await enterPassword(page, 'wrong');

        await expect(card.toggle.input).toBeChecked();
        expect(await stored(storage, KEYS.keywordsOn)).toBe(true);
    });

    test('ST-LK-03 turning a toggle on needs no password', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, [KEYS.phrases]: [], [KEYS.phrasesOn]: false, ...hideList({}) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'phrases').toggle.switch.click();
        await expect.poll(() => stored(storage, KEYS.phrasesOn)).toBe(true);

        await gotoSettings(page, extension.origin, 'hidelist');
        await hideListOption(page, 5).switch.click();
        await expect.poll(async () => JSON.stringify(await stored(storage, KEYS.hideList))).toContain('[5,true]');
        await expect(snackBar(page).root).toHaveCount(0);
    });

    test('ST-LK-04 "Manage restrictions" is blocked until the password is entered', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywords').manageButton.click();

        await expect(snackBar(page).root).toBeVisible();
        await expect(manageDialog(page).root).toHaveCount(0);

        await snackBar(page).actionButton.click();
        await enterPassword(page, PASSWORD);

        await expect(manageDialog(page).root).toBeVisible();
    });

    test('ST-LK-05 adding a keyword needs no password', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...phrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'phrases', 'bad day');

        await expect.poll(() => stored(storage, KEYS.phrases)).toEqual(['bad day']);
        await expect(snackBar(page).root).toHaveCount(0);
    });

    test('ST-LK-07 locked toggles show a lock icon, unlocked ones don\'t', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        await expect(blackListCard(page, 'keywords').toggle.lockIcon).toHaveCount(0);

        await storage.reset({ ...locked, ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        await expect(blackListCard(page, 'keywords').toggle.lockIcon).toBeVisible();
    });

    test('ST-LK-06 the unlock ends after the chosen period', async ({ page, extension, storage }) => {
        test.slow();
        await storage.reset({ ...locked, ...keywordsOn(['cats']), ...phrasesOn(['bad day']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywords').toggle.switch.click();
        await snackBar(page).actionButton.click();
        await enterPassword(page, PASSWORD);
        await expect.poll(() => stored(storage, KEYS.keywordsOn)).toBe(false);

        // period is 30 seconds
        await expect(blackListCard(page, 'phrases').toggle.lockIcon).toBeVisible({ timeout: 40_000 });

        await blackListCard(page, 'phrases').toggle.switch.click();
        await expect(blackListCard(page, 'phrases').toggle.input).toBeChecked();
        expect(await stored(storage, KEYS.phrasesOn)).toBe(true);
    });

    test('ST-PW-E02 the unlock is not shared with another settings tab', async ({ page, extension, storage }) => {
        await storage.reset({ ...locked, ...keywordsOn(['cats']), ...phrasesOn(['bad day']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        await blackListCard(page, 'keywords').toggle.switch.click();
        await snackBar(page).actionButton.click();
        await enterPassword(page, PASSWORD);
        await expect(blackListCard(page, 'keywords').toggle.lockIcon).toHaveCount(0);

        const other = await extension.context.newPage();
        await gotoSettings(other, extension.origin, 'blacklist');

        await expect(blackListCard(other, 'phrases').toggle.lockIcon).toBeVisible();
    });
});
