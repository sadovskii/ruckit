import { test, expect } from '../../support/fixtures';
import { KEYS } from '../../support/storage-data';
import {
    enterPassword, enterPasswordDialog, expectInvalid, gotoSettings, openSection, passwordSection, selectOptions,
    setPasswordDialog, snackBar,
} from '../../support/settings-page';

/* ST-PW-*: setting, removing and changing the password. The lock itself: password-lock.spec.ts */
const PASSWORD = 'password';
const PERIOD = 'free-password-period';

test.describe('settings: password', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    test('ST-PW-01 turning "Password request" on sets a password', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);
        await expect(section.requestToggle.input).not.toBeChecked();

        await section.requestToggle.switch.click();
        const dialog = setPasswordDialog(page);
        await dialog.inputs.nth(0).fill('s3cret');
        await dialog.inputs.nth(1).fill('s3cret');
        await dialog.submit.click();

        await expect(dialog.root).toHaveCount(0);
        await expect.poll(() => stored(storage, PASSWORD)).toBe('s3cret');
        await expect(section.requestToggle.input).toBeChecked();
    });

    test('ST-PW-02 different or empty passwords are not saved', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        const dialog = setPasswordDialog(page);

        await dialog.submit.click();
        await expectInvalid(dialog.inputs.nth(0));

        await dialog.inputs.nth(0).fill('one');
        await dialog.inputs.nth(1).fill('two');
        await dialog.submit.click();

        await expect(dialog.root).toBeVisible();
        expect(await stored(storage, PASSWORD)).toBeUndefined();
    });

    test('ST-PW-03 closing the set-password dialog saves nothing', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        const dialog = setPasswordDialog(page);
        await dialog.inputs.nth(0).fill('s3cret');

        await dialog.closeButton.click();

        await expect(dialog.root).toHaveCount(0);
        expect(await stored(storage, PASSWORD)).toBeUndefined();
        await expect(passwordSection(page).requestToggle.input).not.toBeChecked();
    });

    test('ST-PW-04 turning "Password request" off with the right password removes it', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);
        await expect(section.requestToggle.input).toBeChecked();

        await section.requestToggle.switch.click();
        await enterPassword(page, 's3cret');

        await expect(enterPasswordDialog(page).root).toHaveCount(0);
        await expect.poll(() => stored(storage, PASSWORD)).toBeUndefined();
        await expect(section.requestToggle.input).not.toBeChecked();
    });

    test('ST-PW-05 a wrong password is rejected and the dialog stays open', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');

        await passwordSection(page).requestToggle.switch.click();
        await enterPassword(page, 'wrong');

        const dialog = enterPasswordDialog(page);
        await expect(dialog.root).toBeVisible();
        await expectInvalid(dialog.input);
        expect(await stored(storage, PASSWORD)).toBe('s3cret');
    });

    test('ST-PW-06 change password: wrong current password is rejected', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);

        await section.changeInputs.nth(0).fill('wrong');
        await section.changeInputs.nth(1).fill('new-one');
        await section.changeInputs.nth(2).fill('new-one');
        await section.changeButton.click();

        await expectInvalid(section.changeInputs.nth(0));
        expect(await stored(storage, PASSWORD)).toBe('s3cret');
    });

    test('ST-PW-06 change password: new and confirmation must match', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);

        await section.changeInputs.nth(0).fill('s3cret');
        await section.changeInputs.nth(1).fill('new-one');
        await section.changeInputs.nth(2).fill('new-two');
        await section.changeButton.click();

        await page.waitForTimeout(500);
        expect(await stored(storage, PASSWORD)).toBe('s3cret');
    });

    test('ST-PW-06 change password: success saves it and shows a message', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);

        await section.changeInputs.nth(0).fill('s3cret');
        await section.changeInputs.nth(1).fill('new-one');
        await section.changeInputs.nth(2).fill('new-one');
        await section.changeButton.click();

        await expect.poll(() => stored(storage, PASSWORD)).toBe('new-one');
        await expect(snackBar(page).root).toBeVisible();
        await expect(section.changeInputs.nth(0)).toHaveValue('');
    });

    test('ST-PW-07 change-password form and period are disabled without a password', async ({ page, extension, storage }) => {
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);

        await expect(section.changeButton).toBeDisabled();
        for (let i = 0; i < 3; i++) {
            await expect(section.changeInputs.nth(i)).toBeDisabled();
        }
        await expect(section.periodSelect.locator('button')).toBeDisabled();
    });

    test('ST-PW-08 the unlock period can be set to 1 minute (default 30 seconds)', async ({ page, extension, storage }) => {
        await storage.reset({ [PASSWORD]: 's3cret' });
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        const section = passwordSection(page);
        const shownBefore = await section.periodSelect.innerText();

        await section.periodSelect.click();
        await selectOptions(page).nth(1).click();

        await expect.poll(() => stored(storage, PERIOD)).toBe(60);
        await expect(section.periodSelect).not.toHaveText(shownBefore);
    });

    test('ST-PW-E01 the password is stored as plain text', async ({ page, extension, storage }) => {
        // documents current behaviour (backlog #13); change this test when the password gets hashed
        await storage.reset({});
        await gotoSettings(page, extension.origin);
        await openSection(page, 'password');
        await passwordSection(page).requestToggle.switch.click();
        const dialog = setPasswordDialog(page);
        await dialog.inputs.nth(0).fill('visible');
        await dialog.inputs.nth(1).fill('visible');
        await dialog.submit.click();

        await expect.poll(() => stored(storage, PASSWORD)).toBe('visible');
        expect(KEYS).toBeDefined();
    });
});
