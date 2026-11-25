import { test, expect } from '../../support/fixtures';
import { keywordsAndPhrasesOn } from '../../support/storage-data';
import {
    blackListCard, enterPassword, enterPasswordDialog, gotoSettings, openSection, passwordSection, setPasswordDialog, snackBar,
} from '../../support/settings-page';

/*
 * ST-RS-*: choosing the reset delay, "Forgot password?", the pending reset and its end.
 * A reset is plain storage (an end time), so tests set the end time directly instead of waiting hours.
 */
const PASSWORD = 'password';
const RESET_DELAY = 'password-reset-delay';
const RESET_ENDS_AT = 'password-reset-ends-at';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const PASSWORD_VALUE = 's3cret';

test.describe('settings: password reset', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    // the end time is written by the extension a moment after the test's own clock was read
    const expectEndsAtAbout = async (storage: { get(): Promise<Record<string, unknown>> }, expectedMs: number) => {
        await expect.poll(async () => Math.abs(((await stored(storage, RESET_ENDS_AT)) as number) - expectedMs)).toBeLessThan(MINUTE);
    };

    const openEnterPasswordDialog = async (page: import('@playwright/test').Page, origin: string) => {
        await gotoSettings(page, origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        await expect(enterPasswordDialog(page).root).toBeVisible();
    };

    test('ST-RS-01 setting a password saves the default 4 hour reset delay', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        const dialog = setPasswordDialog(page);
        await expect(dialog.delayPills).toHaveCount(3);
        await expect(dialog.delayPills.nth(1)).toHaveAttribute('aria-checked', 'true');

        await dialog.inputs.nth(0).fill(PASSWORD_VALUE);
        await dialog.inputs.nth(1).fill(PASSWORD_VALUE);
        await dialog.submit.click();

        await expect.poll(() => stored(storage, RESET_DELAY)).toBe(240);
    });

    test('ST-RS-02 the chosen reset delay is saved with the password', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        const dialog = setPasswordDialog(page);

        await dialog.delayPills.nth(2).click();
        await expect(dialog.delayPills.nth(2)).toHaveAttribute('aria-checked', 'true');
        await dialog.inputs.nth(0).fill(PASSWORD_VALUE);
        await dialog.inputs.nth(1).fill(PASSWORD_VALUE);
        await dialog.submit.click();

        await expect.poll(() => stored(storage, RESET_DELAY)).toBe(1440);
        expect(await stored(storage, PASSWORD)).toBe(PASSWORD_VALUE);
    });

    test('ST-RS-03 "Forgot password?" then "Go back" starts no reset', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240 });
        await openEnterPasswordDialog(page, extension.origin);
        const dialog = enterPasswordDialog(page);

        await dialog.link.click();
        await expect(dialog.confirm.root).toBeVisible();
        await dialog.confirm.backButton.click();

        await expect(dialog.confirm.root).toHaveCount(0);
        await expect(dialog.input).toBeVisible();
        expect(await stored(storage, RESET_ENDS_AT)).toBeUndefined();
    });

    test('ST-RS-04 "Start reset" saves the end time and shows the countdown', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 60 });
        await openEnterPasswordDialog(page, extension.origin);
        const dialog = enterPasswordDialog(page);
        const startedAt = Date.now();

        await dialog.link.click();
        await dialog.confirm.startButton.click();

        await expectEndsAtAbout(storage, startedAt + HOUR);
        await expect(dialog.resetInfo).toBeVisible();
        await expect(dialog.confirm.root).toHaveCount(0);
        expect(await stored(storage, PASSWORD)).toBe(PASSWORD_VALUE);
    });

    test('ST-RS-05 a password saved before the reset feature waits 1 day', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE });
        await openEnterPasswordDialog(page, extension.origin);
        const dialog = enterPasswordDialog(page);
        const startedAt = Date.now();

        await dialog.link.click();
        await dialog.confirm.startButton.click();

        await expectEndsAtAbout(storage, startedAt + 24 * HOUR);
    });

    test('ST-RS-06 a pending reset is shown when the dialog opens, and "Cancel reset" stops it', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240, [RESET_ENDS_AT]: Date.now() + 2 * HOUR });
        await openEnterPasswordDialog(page, extension.origin);
        const dialog = enterPasswordDialog(page);
        await expect(dialog.resetInfo).toBeVisible();

        await dialog.link.click();

        await expect(dialog.resetInfo).toHaveCount(0);
        await expect.poll(() => stored(storage, RESET_ENDS_AT)).toBeUndefined();
        expect(await stored(storage, PASSWORD)).toBe(PASSWORD_VALUE);
    });

    test('ST-RS-07 the right password cancels a pending reset and keeps the password', async ({ page, extension, storage }) => {
        await storage.reset({
            [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240, [RESET_ENDS_AT]: Date.now() + 2 * HOUR, ...keywordsAndPhrasesOn(['cats']),
        });
        await gotoSettings(page, extension.origin, 'blacklist');

        // unlocking a locked toggle (not turning the password off) opens the same "Enter your password" dialog
        await blackListCard(page, 'keywordsAndPhrases').toggle.switch.click();
        await snackBar(page).actionButton.click();
        await enterPassword(page, PASSWORD_VALUE);

        await expect(enterPasswordDialog(page).root).toHaveCount(0);
        await expect.poll(() => stored(storage, RESET_ENDS_AT)).toBeUndefined();
        expect(await stored(storage, PASSWORD)).toBe(PASSWORD_VALUE);
    });

    test('ST-RS-08 a reset that ended while the page was closed removes the password', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240, [RESET_ENDS_AT]: Date.now() - MINUTE });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');

        await expect(passwordSection(page).requestToggle.input).not.toBeChecked();
        await expect.poll(() => stored(storage, PASSWORD)).toBeUndefined();
        expect(await stored(storage, RESET_DELAY)).toBeUndefined();
        expect(await stored(storage, RESET_ENDS_AT)).toBeUndefined();
    });

    test('ST-RS-09 a reset that ends while the dialog is open closes it and removes the password', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240, [RESET_ENDS_AT]: Date.now() + 4_000 });
        await openEnterPasswordDialog(page, extension.origin);

        await expect(enterPasswordDialog(page).root).toHaveCount(0, { timeout: 15_000 });

        await expect.poll(() => stored(storage, PASSWORD)).toBeUndefined();
        expect(await stored(storage, RESET_ENDS_AT)).toBeUndefined();
        await expect(passwordSection(page).requestToggle.input).not.toBeChecked();
    });

    test('ST-RS-10 turning "Password request" off removes the reset data too', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: PASSWORD_VALUE, [RESET_DELAY]: 240, [RESET_ENDS_AT]: Date.now() + 2 * HOUR });
        await openEnterPasswordDialog(page, extension.origin);

        await enterPassword(page, PASSWORD_VALUE);

        await expect.poll(() => stored(storage, PASSWORD)).toBeUndefined();
        expect(await stored(storage, RESET_DELAY)).toBeUndefined();
        expect(await stored(storage, RESET_ENDS_AT)).toBeUndefined();
    });
});
