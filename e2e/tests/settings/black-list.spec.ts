import { test, expect, restartExtension, type ExtensionHandle, type ExtensionStorage } from '../../support/fixtures';
import { channelsOn, KEYS, keywordsAndPhrasesOn, legacyPhrasesOn, type StoredData } from '../../support/storage-data';
import { addViaCard, blackListCard, expectInvalid, gotoSettings, openSection, skipUntilMergedListIsPublished } from '../../support/settings-page';

/* ST-BL-*: the black-list cards: Channels, and Keywords and phrases (one list since the merge). See e2e/docs/settings-page.md */
test.describe('settings: black list', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    test('ST-BL-01 two cards show the stored on/off state and counts', async ({ page, extension, storage }) => {
        await skipUntilMergedListIsPublished(page, extension);
        await storage.reset({
            ...channelsOn(['A', 'B']),
            [KEYS.keywordsAndPhrases]: ['one', 'two words', 'three'], [KEYS.keywordsAndPhrasesOn]: false,
        });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(page.locator('app-black-list-simple-item')).toHaveCount(2);
        await expect(blackListCard(page, 'channels').toggle.input).toBeChecked();
        await expect(blackListCard(page, 'keywordsAndPhrases').toggle.input).not.toBeChecked();
        await expect(blackListCard(page, 'channels').count).toContainText('2');
        await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('3');
    });

    test('ST-BL-02 turning a list on is stored', async ({ page, extension, storage }) => {
        await storage.reset({ [KEYS.keywordsAndPhrases]: [], [KEYS.keywordsAndPhrasesOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywordsAndPhrases').toggle.switch.click();

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrasesOn)).toBe(true);
    });

    test('ST-BL-03 turning a list off is stored', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['bad day']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywordsAndPhrases').toggle.switch.click();

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrasesOn)).toBe(false);
        await expect(blackListCard(page, 'keywordsAndPhrases').toggle.input).not.toBeChecked();
    });

    test('ST-BL-04 adds a keyword from the card', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', 'e2e-keyword');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['e2e-keyword']);
        await expect(blackListCard(page, 'keywordsAndPhrases').input).toHaveValue('');
        await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('1');
    });

    test('ST-BL-04 adds a phrase to the same list', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', 'How to cook');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['cats', 'How to cook']);
        await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('2');
    });

    test.describe('phrases saved before the merge', () => {
        /** Saves the old separate lists and restarts the extension, as when a user updates from an older version. */
        const updateFromOldVersion = async ({ extension, storage }: { extension: ExtensionHandle; storage: ExtensionStorage }, oldData: StoredData) => {
            await storage.reset(oldData);
            await restartExtension(extension);
            await expect.poll(async () => KEYS.legacyPhrases in await storage.get(), { message: 'the old phrases list is migrated and removed' }).toBe(false);
        };

        test.beforeEach(async ({ page, extension }) => {
            await skipUntilMergedListIsPublished(page, extension);
        });

        test('ST-BL-12 are moved into the keywords card', async ({ page, extension, storage }) => {
            await updateFromOldVersion({ extension, storage }, { ...keywordsAndPhrasesOn(['cats', 'bad day']), ...legacyPhrasesOn(['bad day', 'How to']) });

            const stored = await storage.get();
            expect(stored[KEYS.keywordsAndPhrases]).toEqual(['cats', 'bad day', 'How to']);
            expect(stored[KEYS.keywordsAndPhrasesOn]).toBe(true);
            expect(KEYS.legacyPhrasesOn in stored).toBe(false);

            await gotoSettings(page, extension.origin, 'blacklist');
            await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('3');
            await expect(blackListCard(page, 'keywordsAndPhrases').toggle.input).toBeChecked();
        });

        test('ST-BL-13 turned-on phrases turn the merged list on even if keywords were off', async ({ page, extension, storage }) => {
            await updateFromOldVersion({ extension, storage }, {
                [KEYS.keywordsAndPhrases]: ['cats'], [KEYS.keywordsAndPhrasesOn]: false,
                ...legacyPhrasesOn(['bad day']),
            });

            expect((await storage.get())[KEYS.keywordsAndPhrasesOn]).toBe(true);
            await gotoSettings(page, extension.origin, 'blacklist');
            await expect(blackListCard(page, 'keywordsAndPhrases').toggle.input).toBeChecked();
        });

        test('ST-BL-13 an empty turned-on phrases list does not turn keywords on', async ({ extension, storage }) => {
            await updateFromOldVersion({ extension, storage }, {
                [KEYS.keywordsAndPhrases]: ['cats'], [KEYS.keywordsAndPhrasesOn]: false,
                ...legacyPhrasesOn([]),
            });

            const stored = await storage.get();
            expect(stored[KEYS.keywordsAndPhrases]).toEqual(['cats']);
            expect(stored[KEYS.keywordsAndPhrasesOn]).toBe(false);
        });

        test('ST-BL-13 turned-off phrases are kept but do not turn keywords on', async ({ extension, storage }) => {
            await updateFromOldVersion({ extension, storage }, {
                [KEYS.keywordsAndPhrases]: ['cats'], [KEYS.keywordsAndPhrasesOn]: false,
                [KEYS.legacyPhrases]: ['bad day'], [KEYS.legacyPhrasesOn]: false,
            });

            const stored = await storage.get();
            expect(stored[KEYS.keywordsAndPhrases]).toEqual(['cats', 'bad day']);
            expect(stored[KEYS.keywordsAndPhrasesOn]).toBe(false);
        });
    });

    test('ST-BL-05 the channels card has no input (channels are added on YouTube)', async ({ page, extension, storage }) => {
        await storage.reset({ ...channelsOn() });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(blackListCard(page, 'channels').input).toHaveCount(0);
        await expect(blackListCard(page, 'channels').addButton).toHaveCount(0);
        await expect(blackListCard(page, 'channels').manageButton).toBeEnabled();
    });

    test('ST-BL-06 input and "Add new" are disabled while the list is off', async ({ page, extension, storage }) => {
        await storage.reset({ [KEYS.keywordsAndPhrases]: [], [KEYS.keywordsAndPhrasesOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');
        const card = blackListCard(page, 'keywordsAndPhrases');

        await expect(card.input).toBeDisabled();
        await expect(card.addButton).toBeDisabled();

        await card.toggle.switch.click();

        await expect(card.input).toBeEnabled();
        await expect(card.addButton).toBeEnabled();
    });

    test('ST-BL-07 an empty input is not added and is marked invalid', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywordsAndPhrases').addButton.click();

        await expectInvalid(blackListCard(page, 'keywordsAndPhrases').input);
        expect(await stored(storage, KEYS.keywordsAndPhrases)).toEqual([]);
    });

    test('ST-BL-08 accepts 30 characters and rejects 31', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const thirty = 'x'.repeat(30);

        await addViaCard(page, 'keywordsAndPhrases', `${thirty}y`);
        await expectInvalid(blackListCard(page, 'keywordsAndPhrases').input);

        await addViaCard(page, 'keywordsAndPhrases', thirty);
        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual([thirty]);
    });

    test('ST-BL-09 a duplicate is not added twice', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', 'cats');
        await addViaCard(page, 'keywordsAndPhrases', 'dogs');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['cats', 'dogs']);
        await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('2');
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
        await storage.reset({ [KEYS.keywordsAndPhrases]: ['x', 'some phrase'], [KEYS.keywordsAndPhrasesOn]: false });
        await gotoSettings(page, extension.origin, 'blacklist');

        await expect(blackListCard(page, 'keywordsAndPhrases').manageButton).toBeDisabled();
    });

    test('ST-BL-E05 pressing Enter in the input adds the item', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await blackListCard(page, 'keywordsAndPhrases').input.fill('enter-key');
        await blackListCard(page, 'keywordsAndPhrases').input.press('Enter');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['enter-key']);
    });

    test('ST-BL-E04 accepts Cyrillic and emoji', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', 'кошки😺');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['кошки😺']);
    });

    // ⚠ needs a decision (see e2e/docs/settings-page.md): today such input is stored as typed
    test.fixme('ST-BL-E01 an input of only spaces is not added', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', '   ');

        expect(await stored(storage, KEYS.keywordsAndPhrases)).toEqual([]);
    });

    test.fixme('ST-BL-E02 leading and trailing spaces are trimmed', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');

        await addViaCard(page, 'keywordsAndPhrases', '  cats  ');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['cats']);
    });

    test('opens the black list from the sidebar', async ({ page, extension }) => {
        await skipUntilMergedListIsPublished(page, extension);
        await gotoSettings(page, extension.origin);
        await openSection(page, 'blacklist');

        await expect(page.locator('app-black-list-simple-item')).toHaveCount(2);
    });
});
