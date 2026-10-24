import { test, expect } from '../../support/fixtures';
import { channelsOn, KEYS, keywordsOn, phrasesOn } from '../../support/storage-data';
import { addViaCard, blackListCard, expectInvalid, gotoSettings, openSection } from '../../support/settings-page';

/* ST-BL-*: the three black-list cards (channels, keywords, phrases). See e2e/docs/settings-page.md */
test.describe('settings: black list', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    test('ST-BL-01 cards show the stored on/off state and counts', async ({ page, extension, storage }) => {
        await storage.reset({
            ...channelsOn(['A', 'B']),
            [KEYS.keywords]: ['one', 'two', 'three'], [KEYS.keywordsOn]: false,
            ...phrasesOn(['some phrase']),
        });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(blackListCard(page, 'channels').toggle.input).toBeChecked();
        await expect(blackListCard(page, 'keywords').toggle.input).not.toBeChecked();
        await expect(blackListCard(page, 'phrases').toggle.input).toBeChecked();
        await expect(blackListCard(page, 'channels').count).toContainText('2');
        await expect(blackListCard(page, 'keywords').count).toContainText('3');
        await expect(blackListCard(page, 'phrases').count).toContainText('1');
    });

    test('ST-BL-02 turning a list on is stored', async ({ page, extension, storage }) => {
        await storage.reset({ [KEYS.keywords]: [], [KEYS.keywordsOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywords').toggle.switch.click();

        await expect.poll(() => stored(storage, KEYS.keywordsOn)).toBe(true);
    });

    test('ST-BL-03 turning a list off is stored', async ({ page, extension, storage }) => {
        await storage.reset({ ...phrasesOn(['bad day']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'phrases').toggle.switch.click();

        await expect.poll(() => stored(storage, KEYS.phrasesOn)).toBe(false);
        await expect(blackListCard(page, 'phrases').toggle.input).not.toBeChecked();
    });

    test('ST-BL-04 adds a keyword from the card', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywords', 'e2e-keyword');

        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual(['e2e-keyword']);
        await expect(blackListCard(page, 'keywords').input).toHaveValue('');
        await expect(blackListCard(page, 'keywords').count).toContainText('1');
    });

    test('ST-BL-04 adds a phrase from the card', async ({ page, extension, storage }) => {
        await storage.reset({ ...phrasesOn(['first phrase']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'phrases', 'How to cook');

        await expect.poll(() => stored(storage, KEYS.phrases)).toEqual(['first phrase', 'How to cook']);
        await expect(blackListCard(page, 'phrases').count).toContainText('2');
    });

    test('ST-BL-05 the channels card has no input (channels are added on YouTube)', async ({ page, extension, storage }) => {
        await storage.reset({ ...channelsOn() });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(blackListCard(page, 'channels').input).toHaveCount(0);
        await expect(blackListCard(page, 'channels').addButton).toHaveCount(0);
        await expect(blackListCard(page, 'channels').manageButton).toBeEnabled();
    });

    test('ST-BL-06 input and "Add new" are disabled while the list is off', async ({ page, extension, storage }) => {
        await storage.reset({ [KEYS.keywords]: [], [KEYS.keywordsOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');
        const card = blackListCard(page, 'keywords');

        await expect(card.input).toBeDisabled();
        await expect(card.addButton).toBeDisabled();

        await card.toggle.switch.click();

        await expect(card.input).toBeEnabled();
        await expect(card.addButton).toBeEnabled();
    });

    test('ST-BL-07 an empty input is not added and is marked invalid', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywords').addButton.click();

        await expectInvalid(blackListCard(page, 'keywords').input);
        expect(await stored(storage, KEYS.keywords)).toEqual([]);
    });

    test('ST-BL-08 accepts 30 characters and rejects 31', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const thirty = 'x'.repeat(30);

        await addViaCard(page, 'keywords', `${thirty}y`);
        await expectInvalid(blackListCard(page, 'keywords').input);

        await addViaCard(page, 'keywords', thirty);
        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual([thirty]);
    });

    test('ST-BL-09 a duplicate is not added twice', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywords', 'cats');
        await addViaCard(page, 'keywords', 'dogs');

        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual(['cats', 'dogs']);
        await expect(blackListCard(page, 'keywords').count).toContainText('2');
    });

    test('ST-BL-10 the count updates live when a channel is hidden on YouTube', async ({ page, extension, storage }) => {
        await storage.reset({ ...channelsOn(['A']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        await expect(blackListCard(page, 'channels').count).toContainText('1');

        // what the "hide channel" button on YouTube does
        await storage.set({ [KEYS.channels]: ['A', 'B', 'C'] });

        await expect(blackListCard(page, 'channels').count).toContainText('3');
    });

    test('ST-BL-11 "Manage restrictions" is disabled while the list is off', async ({ page, extension, storage }) => {
        await storage.reset({ [KEYS.phrases]: ['x'], [KEYS.phrasesOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(blackListCard(page, 'phrases').manageButton).toBeDisabled();
    });

    test('ST-BL-E05 pressing Enter in the input adds the item', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywords').input.fill('enter-key');
        await blackListCard(page, 'keywords').input.press('Enter');

        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual(['enter-key']);
    });

    test('ST-BL-E04 accepts Cyrillic and emoji', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywords', 'кошки😺');

        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual(['кошки😺']);
    });

    // ⚠ needs a decision (see e2e/docs/settings-page.md): today such input is stored as typed
    test.fixme('ST-BL-E01 an input of only spaces is not added', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywords', '   ');

        expect(await stored(storage, KEYS.keywords)).toEqual([]);
    });

    test.fixme('ST-BL-E02 leading and trailing spaces are trimmed', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywords', '  cats  ');

        await expect.poll(() => stored(storage, KEYS.keywords)).toEqual(['cats']);
    });

    test('opens the black list from the sidebar', async ({ page, extension }) => {
        await gotoSettings(page, extension.origin);
        await openSection(page, 'blacklist');

        await expect(page.locator('app-black-list-simple-item')).toHaveCount(3);
    });
});
