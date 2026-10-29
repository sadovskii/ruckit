import { test, expect } from '../../support/fixtures';
import { channelsOn, KEYS, keywordsAndPhrasesOn } from '../../support/storage-data';
import { blackListCard, gotoSettings, manageDialog, openManageDialog } from '../../support/settings-page';

/* ST-MR-*: "Manage restrictions" dialog. See e2e/docs/settings-page.md */
test.describe('settings: manage restrictions', () => {
    const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

    test('ST-MR-01 shows the list sorted alphabetically and the count', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['dogs', 'Cats', 'birds']) });
        await gotoSettings(page, extension.origin, 'blacklist');

        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await expect(dialog.itemNames).toHaveText(['birds', 'Cats', 'dogs']);
        await expect(dialog.count).toContainText('3');
    });

    test('ST-MR-02 search filters the list (case-insensitive)', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['How to cook', 'bad day', 'how TO fish', 'cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.search.fill('how to');

        await expect(dialog.itemNames).toHaveText(['How to cook', 'how TO fish']);

        await dialog.search.fill('');

        await expect(dialog.itemNames).toHaveCount(4);
    });

    test('ST-MR-03 nothing found: "Add new restriction" adds the search text', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.search.fill('parrots');
        await expect(dialog.notFound).toBeVisible();
        await dialog.notFoundAddButton.click();

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['cats', 'parrots']);
        await expect(dialog.item('parrots')).toBeVisible();
    });

    test('ST-MR-04 an empty list shows a message and disables the search', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn([]) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await expect(dialog.empty).toBeVisible();
        await expect(dialog.search).toBeDisabled();
    });

    test('ST-MR-05 removes an item', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['birds', 'cats', 'dogs']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.remove('cats');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['birds', 'dogs']);
        await expect(dialog.itemNames).toHaveText(['birds', 'dogs']);
        await expect(dialog.count).toContainText('2');
    });

    test('ST-MR-06 removes the right item while the list is filtered', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['apple', 'banana', 'cherry', 'grape']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.search.fill('rap');
        await expect(dialog.itemNames).toHaveText(['grape']);
        await dialog.remove('grape');

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['apple', 'banana', 'cherry']);
    });

    test('ST-MR-07 adds an item (a phrase) with the dialog form', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['cats']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.newInput.fill('bad day');
        await dialog.newButton.click();

        await expect.poll(() => stored(storage, KEYS.keywordsAndPhrases)).toEqual(['cats', 'bad day']);
        await expect(dialog.item('bad day')).toBeVisible();
        await expect(dialog.newInput).toHaveValue('');
    });

    test('ST-MR-08 channels: no add form and no adding from the search', async ({ page, extension, storage }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'channels');

        await expect(dialog.newInput).toHaveCount(0);
        await dialog.search.fill('nothing like this');
        await expect(dialog.notFound).toBeVisible();
        await expect(dialog.notFoundAddButton).toHaveCount(0);
    });

    test('ST-MR-09 the channels list updates live while the dialog is open', async ({ page, extension, storage }) => {
        await storage.reset({ ...channelsOn(['A']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'channels');

        // what the "hide channel" button on YouTube does
        await storage.set({ [KEYS.channels]: ['A', 'B'] });

        await expect(dialog.itemNames).toHaveText(['A', 'B']);
    });

    test('ST-MR-10 closing the dialog shows the new count on the card', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['a', 'b', 'c']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.remove('b');
        await dialog.closeButton.click();

        await expect(manageDialog(page).root).toHaveCount(0);
        await expect(blackListCard(page, 'keywordsAndPhrases').count).toContainText('2');
    });

    test('ST-MR-E03 removing the last search match clears the search', async ({ page, extension, storage }) => {
        await storage.reset({ ...keywordsAndPhrasesOn(['apple', 'banana']) });
        await gotoSettings(page, extension.origin, 'blacklist');
        const dialog = await openManageDialog(page, 'keywordsAndPhrases');

        await dialog.search.fill('banana');
        await dialog.remove('banana');

        await expect(dialog.search).toHaveValue('');
        await expect(dialog.itemNames).toHaveText(['apple']);
    });
});
