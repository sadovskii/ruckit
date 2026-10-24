import { test, expect } from '../../support/fixtures';
import { channelsOn, keywordsOn, KEYS, phrasesOn } from '../../support/storage-data';
import { homeFeedPage, searchResultsPage, watchPage, youtubeUrl } from '../../support/youtube-mock';
import { video, waitForContentScript } from '../../support/page-helpers';

/*
 * Keyword and phrase restrictions on (mocked) YouTube pages.
 * The channels restriction is turned on in every test: the feed is only filtered while it is on,
 * and its "hide channel" buttons tell when the content script has processed the page.
 */
test.describe('black list: keywords and phrases', () => {
    test('hides search results matching a keyword (case-insensitive)', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['CATS']) });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('hides search results containing a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...phrasesOn(['How to cook']) });

        await page.goto(youtube.serve(youtubeUrl.search('pasta'), searchResultsPage([
            { title: 'How to cook pasta' },
            { title: 'Pasta history' },
        ])));

        await expect(video(page, 'How to cook pasta')).toHaveCount(0);
        await expect(video(page, 'Pasta history')).toBeVisible();
    });

    test('shows everything when keywords and phrases are turned off', async ({ page, storage, youtube }) => {
        await storage.reset({
            ...channelsOn(),
            [KEYS.keywords]: ['cats'], [KEYS.keywordsOn]: false,
            [KEYS.phrases]: ['How to cook'], [KEYS.phrasesOn]: false,
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
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.home(), homeFeedPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('hides "up next" videos on the watch page matching a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...phrasesOn(['bad day']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Morning routine' }, [
            { title: 'What a bad day' },
            { title: 'Great morning' },
        ])));

        await expect(video(page, 'What a bad day')).toHaveCount(0);
        await expect(video(page, 'Great morning')).toBeVisible();
    });

    test('redirects to the restricted page when the opened video matches a keyword', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Funny cats compilation' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('redirects to the restricted page when the opened video matches a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...phrasesOn(['How to cook']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'How to cook pasta' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('does not redirect when the opened video matches nothing', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']), ...phrasesOn(['bad day']) });
        const url = youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Great morning' }));

        await page.goto(url);
        await waitForContentScript(page);
        // the redirect is requested through the background script, give it time to happen if it would
        await page.waitForTimeout(2_000);

        await expect(page).toHaveURL(url);
    });

    test('applies a keyword added while the page is open', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn([]) });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation' },
            { title: 'Dogs at the beach' },
        ])));
        await waitForContentScript(page);
        await expect(video(page, 'Funny cats compilation')).toBeVisible();

        await storage.set({ [KEYS.keywords]: ['cats'] });

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });
});
