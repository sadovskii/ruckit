import { test, expect } from '../../support/fixtures';
import { channelsOn, hideList, KEYS, keywordsOn, phrasesOn } from '../../support/storage-data';
import { channelPage, homeFeedPage, searchResultsPage, shortsPage, watchPage, youtubeUrl } from '../../support/youtube-mock';
import { blackListButtons, video, waitForContentScript } from '../../support/page-helpers';

/*
 * YouTube page behaviour against fake pages (deterministic, offline). IDs refer to e2e/docs/youtube-page.md.
 * Pages are served by the YouTube mock, so the content script runs exactly as on youtube.com.
 */
const stored = async (storage: { get(): Promise<Record<string, unknown>> }, key: string) => (await storage.get())[key];

test.describe('youtube page: channels', () => {
    test('YT-CH-02 the ✕ button on the home feed blocks the channel and hides its videos', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn() });
        await page.goto(youtube.serve(youtubeUrl.home(), homeFeedPage([
            { title: 'Funny cats', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ])));
        await waitForContentScript(page);

        await video(page, 'Funny cats').locator('.blb-conainer').click();

        await expect.poll(() => stored(storage, KEYS.channels)).toEqual(['Cat Channel']);
        await expect(video(page, 'Funny cats')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('YT-CH-03 the ✕ button under a video blocks its channel and the video is replaced', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn() });
        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Morning routine', channel: 'Routine Channel' })));

        await page.locator('#owner .blb-conainer').click();

        await expect.poll(() => stored(storage, KEYS.channels)).toEqual(['Routine Channel']);
        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('YT-CH-05 the ✕ button on a channel page blocks it and the page is replaced', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn() });
        await page.goto(youtube.serve(youtubeUrl.channel('catchannel'), channelPage('Cat Channel')));

        await page.locator('yt-page-header-renderer yt-flexible-actions-view-model .blb-conainer').click();

        await expect.poll(() => stored(storage, KEYS.channels)).toEqual(['Cat Channel']);
        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('YT-CH-08 a blocked channel is also removed from channel results in search', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });
        await page.goto(youtube.serve(youtubeUrl.search('channels'), searchResultsPage(
            [{ title: 'Dogs at the beach', channel: 'Dog Channel' }],
            { channels: ['Cat Channel', 'Dog Channel'] },
        )));
        await waitForContentScript(page);

        await expect(page.locator('[data-e2e="channel-result"][data-channel="Cat Channel"]')).toHaveCount(0);
        await expect(page.locator('[data-e2e="channel-result"][data-channel="Dog Channel"]')).toBeVisible();
    });

    test('YT-CH-09 videos of a blocked channel are removed from the home feed', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });
        await page.goto(youtube.serve(youtubeUrl.home(), homeFeedPage([
            { title: 'Funny cats', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ])));

        await expect(video(page, 'Funny cats')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('YT-CH-09 videos of a blocked channel are removed from "up next"', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });
        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Morning routine', channel: 'Routine Channel' }, [
            { title: 'Funny cats', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ])));

        await expect(video(page, 'Funny cats')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('YT-CH-10 opening a video of a blocked channel shows the restricted page', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });

        await page.goto(youtube.serve(youtubeUrl.watch(), watchPage({ title: 'Any title', channel: 'Cat Channel' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('YT-CH-13 turning the channels list on while a page is open adds the buttons', async ({ page, storage, youtube }) => {
        await storage.reset({ [KEYS.channels]: [], [KEYS.channelsOn]: false, ...keywordsOn(['e2e-marker']) });
        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([{ title: 'e2e-marker' }, { title: 'Funny cats' }])));
        await expect(video(page, 'e2e-marker')).toHaveCount(0);
        await expect(blackListButtons(page)).toHaveCount(0);

        await storage.set({ [KEYS.channelsOn]: true });

        await expect(video(page, 'Funny cats').locator('.blb-conainer')).toBeAttached();
    });

    test('YT-CH-E01 a channel name longer than 60 characters is stored cut to 60 and still hidden', async ({ page, storage, youtube }) => {
        const longName = `Channel ${'x'.repeat(70)}`;
        await storage.reset({ ...channelsOn() });
        await page.goto(youtube.serve(youtubeUrl.search('long'), searchResultsPage([{ title: 'Long one', channel: longName }, { title: 'Other' }])));
        await waitForContentScript(page);

        await video(page, 'Long one').locator('.blb-conainer').click();

        await expect.poll(() => stored(storage, KEYS.channels)).toEqual([longName.substring(0, 60)]);
        await expect(video(page, 'Long one')).toHaveCount(0);
    });

    test('YT-CH-E04 a channel name that looks like HTML is stored as plain text', async ({ page, storage, youtube }) => {
        const name = '<b>Bold</b> & "Co"';
        await storage.reset({ ...channelsOn() });
        await page.goto(youtube.serve(youtubeUrl.search('html'), searchResultsPage([{ title: 'Tricky', channel: name }, { title: 'Other' }])));
        await waitForContentScript(page);

        await video(page, 'Tricky').locator('.blb-conainer').click();

        await expect.poll(() => stored(storage, KEYS.channels)).toEqual([name]);
        await expect(page.locator('b')).toHaveCount(0);
    });

    test('YT-CH-E07 a channel hidden in one tab disappears in another open YouTube tab', async ({ page, storage, youtube, extension }) => {
        await storage.reset({ ...channelsOn() });
        const url = youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ]));
        const other = await extension.context.newPage();
        await other.goto(url);
        await page.goto(url);
        await waitForContentScript(page);

        await video(page, 'Funny cats').locator('.blb-conainer').click();

        await expect(video(other, 'Funny cats')).toHaveCount(0);
        await expect(video(other, 'Dogs at the beach')).toBeVisible();
    });
});

test.describe('youtube page: keywords and phrases', () => {
    test('YT-KW-05 a keyword in a channel name replaces the channel page', async ({ page, storage, youtube }) => {
        // the channel page is only checked while the channels list is on (YT-KW-E02)
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });

        await page.goto(youtube.serve(youtubeUrl.channel('catstv'), channelPage('Funny Cats TV')));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('YT-KW-E03 a keyword also matches inside longer words', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['hate']) });
        await page.goto(youtube.serve(youtubeUrl.search('words'), searchResultsPage([{ title: 'Whatever happens' }, { title: 'Good news' }])));

        await expect(video(page, 'Whatever happens')).toHaveCount(0);
        await expect(video(page, 'Good news')).toBeVisible();
    });

    // ⚠ need a decision (see e2e/docs/youtube-page.md); they describe the probably intended behaviour
    test.fixme('YT-KW-E05 a phrase matches regardless of letter case', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...phrasesOn(['How to cook']) });
        await page.goto(youtube.serve(youtubeUrl.search('case'), searchResultsPage([{ title: 'how to cook pasta' }, { title: 'Other' }])));

        await expect(video(page, 'how to cook pasta')).toHaveCount(0);
    });

    test.fixme('YT-KW-E07 a keyword with a space matches like a phrase', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cat video']) });
        await page.goto(youtube.serve(youtubeUrl.search('space'), searchResultsPage([{ title: 'Best cat video ever' }, { title: 'Other' }])));

        await expect(video(page, 'Best cat video ever')).toHaveCount(0);
    });

    test.fixme('YT-KW-E01 keywords hide home feed videos even while the channels list is off', async ({ page, storage, youtube }) => {
        await storage.reset({ [KEYS.channelsOn]: false, ...keywordsOn(['cats']) });
        await page.goto(youtube.serve(youtubeUrl.home(), homeFeedPage([{ title: 'Funny cats' }, { title: 'Other' }])));

        await expect(video(page, 'Funny cats')).toHaveCount(0);
    });

    test.fixme('YT-PT-07 a premiere matching a keyword is replaced like a normal video', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });
        await page.goto(youtube.serve(youtubeUrl.premiere(), watchPage({ title: 'Cats premiere' })));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });
});

test.describe('youtube page: shorts', () => {
    test('YT-PT-05 "Hide Shorts" replaces a Shorts page with the restricted page', async ({ page, storage, youtube }) => {
        await storage.reset({ ...hideList({ generalHideShorts: true }) });

        await page.goto(youtube.serve(youtubeUrl.shorts(), shortsPage()));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('YT-PT-05 without "Hide Shorts" a Shorts page stays', async ({ page, storage, youtube }) => {
        await storage.reset({ ...hideList({ generalHideShorts: false }) });
        const url = youtube.serve(youtubeUrl.shorts(), shortsPage());

        await page.goto(url);
        await page.waitForTimeout(3_000);

        await expect(page).toHaveURL(url);
        await expect(page.locator('[data-e2e="shorts-player"]')).toBeVisible();
    });
});

test.describe('youtube page: install', () => {
    test('YT-BG-01 a fresh install turns on the channels list and "Hide Shorts"', async ({ extension, storage }) => {
        test.skip(extension.attached, 'only a new temporary profile shows the install defaults');

        const data = await storage.get();

        expect(data[KEYS.channelsOn]).toBe(true);
        expect(data[KEYS.hideList]).toEqual([[18, true]]);
    });
});
