import { test, expect, restartExtension } from '../../support/fixtures';
import { channelsOn, keywordsAndPhrasesOn, KEYS, legacyPhrasesOn } from '../../support/storage-data';
import { homeFeedPage, searchResultsPage, watchPage, youtubeUrl } from '../../support/youtube-mock';
import { video, waitForContentScript } from '../../support/page-helpers';

/*
 * The "keywords and phrases" restriction on (mocked) YouTube pages. Words and phrases are items of one list
 * (the separate phrases list was merged into keywords); an item hides a video whose title contains it, ignoring case.
 * The channels restriction is turned on in every test: the feed is only filtered while it is on,
 * and its "hide channel" buttons tell when the content script has processed the page.
 */
test.describe('black list: keywords and phrases', () => {
    test('hides search results matching a keyword (case-insensitive)', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['CATS']) });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('hides search results containing a phrase from the list (case-insensitive)', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['How to cook']) });

        await page.goto(youtube.serve(youtubeUrl.search('pasta'), searchResultsPage([
            { title: 'How to cook pasta' },
            { title: 'HOW TO COOK rice' },
            { title: 'How to eat pasta' },
            { title: 'Pasta history' },
        ])));

        await expect(video(page, 'How to cook pasta')).toHaveCount(0);
        await expect(video(page, 'HOW TO COOK rice')).toHaveCount(0);
        // all the words, but not as the phrase
        await expect(video(page, 'How to eat pasta')).toBeVisible();
        await expect(video(page, 'Pasta history')).toBeVisible();
    });

    test('one list holds words and phrases together', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats', 'bad day']) });

        await page.goto(youtube.serve(youtubeUrl.search('mix'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'What a bad day' },
            { title: 'Great morning' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'What a bad day')).toHaveCount(0);
        await expect(video(page, 'Great morning')).toBeVisible();
    });

    test('shows everything when the list is turned off', async ({ page, storage, youtube }) => {
        await storage.reset({
            ...channelsOn(),
            [KEYS.keywordsAndPhrases]: ['cats', 'How to cook'], [KEYS.keywordsAndPhrasesOn]: false,
        });

        await page.goto(youtube.serve(youtubeUrl.search('mix'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'How to cook pasta' },
        ])));
        await waitForContentScript(page);

        await expect(video(page, 'Funny cats compilation')).toBeVisible();
        await expect(video(page, 'How to cook pasta')).toBeVisible();
    });

    test('hides home feed videos matching a keyword', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.home(), homeFeedPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('hides "up next" videos on the watch page matching a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['bad day']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Morning routine' }, [
            { title: 'What a bad day' },
            { title: 'Great morning' },
        ])));

        await expect(video(page, 'What a bad day')).toHaveCount(0);
        await expect(video(page, 'Great morning')).toBeVisible();
    });

    test('redirects to the restricted page when the opened video matches a keyword', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Funny cats compilation' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('redirects to the restricted page when the opened video matches a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['How to cook']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'How to cook pasta' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('does not redirect when the opened video matches nothing', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats', 'bad day']) });
        const url = youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Great morning' }));

        await page.goto(url);
        await waitForContentScript(page);
        // the redirect is requested through the background script, give it time to happen if it would
        await page.waitForTimeout(2_000);

        await expect(page).toHaveURL(url);
    });

    test('applies a keyword added while the page is open', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn([]) });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));
        await waitForContentScript(page);
        await expect(video(page, 'Funny cats compilation')).toBeVisible();

        await storage.set({ [KEYS.keywordsAndPhrases]: ['cats'] });

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('applies a phrase added while the page is open', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.search('pasta'), searchResultsPage([
            { title: 'How to cook pasta' },
            { title: 'Pasta history' },
        ])));
        await waitForContentScript(page);
        await expect(video(page, 'How to cook pasta')).toBeVisible();

        await storage.set({ [KEYS.keywordsAndPhrases]: ['cats', 'How to cook'] });

        await expect(video(page, 'How to cook pasta')).toHaveCount(0);
        await expect(video(page, 'Pasta history')).toBeVisible();
    });

    test.describe('phrases saved before the merge', () => {
        const searchPage = (titles: string[]) => searchResultsPage(titles.map(title => ({ title })));

        test('still hide videos before the extension has migrated them', async ({ page, storage, youtube }) => {
            // the background migrates the old list on startup; the content scripts merge it on their own meanwhile
            await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats']), ...legacyPhrasesOn(['bad day']) });

            await page.goto(youtube.serve(youtubeUrl.search('old'), searchPage(['Funny cats compilation', 'What a bad day', 'Great morning'])));

            await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
            await expect(video(page, 'What a bad day')).toHaveCount(0);
            await expect(video(page, 'Great morning')).toBeVisible();
        });

        test('hide videos even if keywords were turned off', async ({ page, storage, youtube }) => {
            await storage.reset({ ...channelsOn(), [KEYS.keywordsAndPhrases]: [], [KEYS.keywordsAndPhrasesOn]: false, ...legacyPhrasesOn(['bad day']) });

            await page.goto(youtube.serve(youtubeUrl.search('old'), searchPage(['What a bad day', 'Great morning'])));

            await expect(video(page, 'What a bad day')).toHaveCount(0);
            await expect(video(page, 'Great morning')).toBeVisible();
        });

        test('keep hiding videos after the extension restarts and migrates them', async ({ page, storage, youtube, extension }) => {
            await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn(['cats']), ...legacyPhrasesOn(['bad day']) });
            await restartExtension(extension);
            await expect.poll(async () => (await storage.get())[KEYS.keywordsAndPhrases]).toEqual(['cats', 'bad day']);

            await page.goto(youtube.serve(youtubeUrl.search('old'), searchPage(['Funny cats compilation', 'What a bad day', 'Great morning'])));

            await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
            await expect(video(page, 'What a bad day')).toHaveCount(0);
            await expect(video(page, 'Great morning')).toBeVisible();
        });
    });
});
