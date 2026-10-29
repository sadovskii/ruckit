import { test, expect } from '../../support/fixtures';
import { channelsOn, hideList, KEYS, keywordsAndPhrasesOn } from '../../support/storage-data';
import { skipUntilMergedListIsPublished } from '../../support/settings-page';
import {
    countMatching, countVideos, expectSignedIn, firstSearchResult, HOME_FEED, openYouTube, pickKeyword, pickPhrase,
    readTitles, realUrl, SEARCH_RESULTS, UP_NEXT, waitForVideos,
} from '../../support/youtube-real';

/*
 * The black list on the real youtube.com. Keywords and phrases are picked from the titles shown at the
 * moment, then turned on while the page is open, and the matching videos must disappear.
 */
test.describe('black list on real YouTube', () => {
    test('search: hides results matching a keyword', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn([]) });
        await openYouTube(page, realUrl.search());
        await waitForVideos(page, SEARCH_RESULTS);

        const keyword = pickKeyword(await readTitles(page, SEARCH_RESULTS));
        test.info().annotations.push({ type: 'keyword', description: keyword });
        await storage.set({ [KEYS.keywordsAndPhrases]: [keyword] });

        await expect.poll(() => countMatching(page, SEARCH_RESULTS, keyword)).toBe(0);
        expect(await countVideos(page, SEARCH_RESULTS), 'videos without the keyword must stay').toBeGreaterThan(0);
    });

    test('search: hides results containing a phrase from the keywords list', async ({ page, storage, extension }) => {
        // older store versions match only single words in the keywords list
        await skipUntilMergedListIsPublished(page, extension);
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn([]) });
        await openYouTube(page, realUrl.search());
        await waitForVideos(page, SEARCH_RESULTS);

        const phrase = pickPhrase(await readTitles(page, SEARCH_RESULTS));
        test.info().annotations.push({ type: 'phrase', description: phrase });
        await storage.set({ [KEYS.keywordsAndPhrases]: [phrase.toLocaleUpperCase()] });

        await expect.poll(() => countMatching(page, SEARCH_RESULTS, phrase)).toBe(0);
        expect(await countVideos(page, SEARCH_RESULTS), 'videos without the phrase must stay').toBeGreaterThan(0);
    });

    test('search: "hide channel" button blocks the channel and hides its videos', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        const channelPath = new URL(result.channelHref).pathname;
        const video = page.locator(SEARCH_RESULTS.item)
            .filter({ has: page.locator(`#channel-info ytd-channel-name a[href="${channelPath}"]`) })
            .first();

        await video.locator('.blb-conainer').click();

        const blockedName = result.channelName.substring(0, 60);
        await expect.poll(async () => (await storage.get())[KEYS.channels]).toEqual([blockedName]);
        await expect.poll(() => page.locator(SEARCH_RESULTS.item).evaluateAll((items, name) => items.filter(item =>
            item.querySelector('#channel-info ytd-channel-name a')?.textContent?.trim().substring(0, 60) === name).length, blockedName)).toBe(0);
    });

    test('home feed: hides videos matching a keyword', async ({ page, storage }) => {
        // the feed is only filtered while the channels restriction is on
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn([]) });
        await openYouTube(page, realUrl.home);
        await expectSignedIn(page);
        await waitForVideos(page, HOME_FEED);

        const keyword = pickKeyword(await readTitles(page, HOME_FEED));
        test.info().annotations.push({ type: 'keyword', description: keyword });
        await storage.set({ [KEYS.keywordsAndPhrases]: [keyword] });

        await expect.poll(() => countMatching(page, HOME_FEED, keyword)).toBe(0);
        expect(await countVideos(page, HOME_FEED), 'videos without the keyword must stay').toBeGreaterThan(0);
    });

    test('watch page: hides "up next" videos matching a keyword', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn(), ...keywordsAndPhrasesOn([]) });
        const result = await firstSearchResult(page);
        await openYouTube(page, result.href);
        await waitForVideos(page, UP_NEXT);

        // the opened video must not match, otherwise the whole page is redirected to the restricted page
        const openedTitle = await page.locator('ytd-watch-metadata #title').first().textContent().catch(() => '') ?? '';
        const keyword = pickKeyword(await readTitles(page, UP_NEXT), `${result.title} ${openedTitle}`);
        test.info().annotations.push({ type: 'keyword', description: keyword });
        await storage.set({ [KEYS.keywordsAndPhrases]: [keyword] });

        await expect.poll(() => countMatching(page, UP_NEXT, keyword)).toBe(0);
        expect(await countVideos(page, UP_NEXT), 'videos without the keyword must stay').toBeGreaterThan(0);
    });

    test('watch page: a video matching a keyword is replaced by the restricted page', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        const keyword = pickKeyword([result.title, '']);
        test.info().annotations.push({ type: 'keyword', description: keyword });
        await storage.set(keywordsAndPhrasesOn([keyword]));

        await openYouTube(page, result.href);

        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
        await expect(page.frameLocator('iframe').first().locator('.ruckit-constraint-main'), 'restricted page content').toBeAttached({ timeout: 20_000 });
    });

    test('channel page: a blocked channel is replaced by the restricted page', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        await storage.set(channelsOn([result.channelName.substring(0, 60)]));

        await openYouTube(page, result.channelHref);

        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
    });

    test('YT-CH-10 opening a video of a blocked channel shows the restricted page', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        await storage.set(channelsOn([result.channelName.substring(0, 60)]));

        await openYouTube(page, result.href);

        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
    });

    test('YT-CH-03 the ✕ button under a video blocks its channel', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        await openYouTube(page, result.href);

        const ownerName = (await page.locator('#owner ytd-video-owner-renderer #upload-info #channel-name #text-container a').first().textContent())!.trim();
        await page.locator('#owner .blb-conainer').click({ timeout: 20_000 });

        await expect.poll(async () => (await storage.get())[KEYS.channels]).toEqual([ownerName.substring(0, 60)]);
        // the opened video now belongs to a blocked channel
        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
    });

    test('YT-CH-05 the ✕ button on a channel page blocks the channel', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        await openYouTube(page, result.channelHref);

        await page.locator('yt-page-header-renderer yt-flexible-actions-view-model .blb-conainer').click({ timeout: 20_000 });

        await expect.poll(async () => ((await storage.get())[KEYS.channels] as string[] | undefined)?.length ?? 0).toBe(1);
        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
    });

    test('YT-RP-03 "Go to the main page" on the restricted page opens the YouTube home page', async ({ page, storage }) => {
        await storage.reset({ ...channelsOn() });
        const result = await firstSearchResult(page);
        await storage.set(channelsOn([result.channelName.substring(0, 60)]));
        await openYouTube(page, result.href);
        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });

        const restricted = page.frameLocator('iframe').first().locator('.ruckit-constraint-main');
        await restricted.locator('a.button').click({ timeout: 20_000 });

        // the whole tab must go to the home page, not only the frame of YouTube's 404 page
        await expect(page).toHaveURL('https://www.youtube.com/', { timeout: 20_000 });
    });
});

test.describe('shorts on real YouTube', () => {
    async function aShortsUrl(page: import('@playwright/test').Page): Promise<string> {
        await openYouTube(page, realUrl.search());
        const link = page.locator('ytd-search a[href^="/shorts/"]').first();
        await expect(link, 'no Shorts in the search results').toBeAttached({ timeout: 30_000 });

        return new URL((await link.getAttribute('href'))!, realUrl.home).toString();
    }

    test('YT-PT-05 "Hide Shorts" replaces a Shorts page with the restricted page', async ({ page, storage }) => {
        await storage.reset(hideList({ generalHideShorts: false }));
        const shortsUrl = await aShortsUrl(page);
        await storage.set(hideList({ generalHideShorts: true }));

        await openYouTube(page, shortsUrl);

        await expect(page).toHaveURL(/\/-rp$/, { timeout: 20_000 });
    });

    test('YT-PT-05 without "Hide Shorts" a Shorts page plays', async ({ page, storage }) => {
        await storage.reset(hideList({ generalHideShorts: false }));
        const shortsUrl = await aShortsUrl(page);

        await openYouTube(page, shortsUrl);
        await expect(page.locator('ytd-shorts')).toBeAttached({ timeout: 20_000 });
        await page.waitForTimeout(3_000);

        await expect(page).toHaveURL(/\/shorts\//);
    });
});
