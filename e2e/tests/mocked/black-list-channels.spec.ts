import { test, expect } from '../../support/fixtures';
import { channelsOn, KEYS, keywordsOn } from '../../support/storage-data';
import { channelPage, searchResultsPage, youtubeUrl } from '../../support/youtube-mock';
import { blackListButtons, video, waitForContentScript } from '../../support/page-helpers';

test.describe('black list: channels', () => {
    test('adds a channel with the "hide channel" button and hides its videos', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn() });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ])));
        await waitForContentScript(page);

        await video(page, 'Funny cats compilation').locator('.blb-conainer').click();

        await expect.poll(async () => (await storage.get())[KEYS.channels]).toEqual(['Cat Channel']);
        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('hides videos of blocked channels in search results', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'Funny cats compilation', channel: 'Cat Channel' },
            { title: 'Dogs at the beach', channel: 'Dog Channel' },
        ])));

        await expect(video(page, 'Funny cats compilation')).toHaveCount(0);
        await expect(video(page, 'Dogs at the beach')).toBeVisible();
    });

    test('redirects from the page of a blocked channel', async ({ page, storage, youtube }) => {
        await storage.reset({ ...channelsOn(['Cat Channel']) });

        await page.goto(youtube.serve(youtubeUrl.channel('catchannel'), channelPage('Cat Channel')));

        await expect(page).toHaveURL(youtubeUrl.restricted());
    });

    test('shows no buttons and hides no channels when the restriction is off', async ({ page, storage, youtube }) => {
        await storage.reset({
            [KEYS.channels]: ['Cat Channel'], [KEYS.channelsOn]: false,
            // a removed keyword match proves the content script has processed the page
            ...keywordsOn(['e2e-marker']),
        });

        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([
            { title: 'e2e-marker video' },
            { title: 'Funny cats compilation', channel: 'Cat Channel' },
        ])));
        await expect(video(page, 'e2e-marker video')).toHaveCount(0);

        await expect(video(page, 'Funny cats compilation')).toBeVisible();
        await expect(blackListButtons(page)).toHaveCount(0);
    });
});
