import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures';
import { HIDE_LIST_ITEM, hideList } from '../../support/storage-data';
import { expectSignedIn, firstSearchResult, openYouTube, realUrl } from '../../support/youtube-real';

/*
 * The hide list on the real youtube.com (IDs: e2e/docs/youtube-page.md). Each test first checks with the option OFF
 * that YouTube still renders the element under the selector the extension hides (otherwise a renamed element would
 * make the test pass without hiding anything), then turns the option ON and expects the element to be hidden.
 * Hide-list CSS is inserted when a page loads, so the page is reloaded after changing the option.
 */
type OptionName = keyof typeof HIDE_LIST_ITEM;

/** Checks the element shows with the option off and is hidden after turning it on and reloading. */
async function expectOptionHides(page: Page, storage: { reset(data: Record<string, unknown>): Promise<void>; set(data: Record<string, unknown>): Promise<void> },
    option: OptionName, selector: string, open: () => Promise<void>): Promise<void> {
    await storage.reset(hideList({ [option]: false }));
    await open();

    await expect(page.locator(selector).first(), `YouTube shows no "${selector}" (the element this option hides)`).toBeAttached({ timeout: 30_000 });
    expect(await countDisplayed(page, selector), `"${selector}" is hidden although the option is off`).toBeGreaterThan(0);

    await storage.set(hideList({ [option]: true }));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator(selector).first()).toBeAttached({ timeout: 30_000 });

    await expect.poll(() => countDisplayed(page, selector)).toBe(0);
}

test.describe('hide list on real YouTube', () => {
    const SHORTS_IN_SEARCH = 'ytd-reel-shelf-renderer, ytd-search grid-shelf-view-model:has(ytm-shorts-lockup-view-model)';
    const NOTIFICATIONS_BELL = 'ytd-notification-topbar-button-renderer';

    test('YT-HL-01 "Hide Shorts" hides shorts in search results', async ({ page, storage }) => {
        await storage.reset(hideList({ generalHideShorts: false }));
        await openYouTube(page, realUrl.search());

        await expect(page.locator(SHORTS_IN_SEARCH).first(), 'YouTube shows no shorts under the hidden selectors').toBeVisible({ timeout: 30_000 });

        await storage.set(hideList({ generalHideShorts: true }));
        await page.reload({ waitUntil: 'domcontentloaded' });

        await expect(page.locator('ytd-video-renderer').first()).toBeVisible({ timeout: 30_000 });
        await expect.poll(() => countVisible(page, SHORTS_IN_SEARCH)).toBe(0);
    });

    test('YT-HL-04 "Notifications Bell" hides the bell', async ({ page, storage }) => {
        await storage.reset(hideList({ headerNotificationsBell: false }));
        await openYouTube(page, realUrl.home);
        await expectSignedIn(page);

        await expect(page.locator(NOTIFICATIONS_BELL).first(), 'YouTube shows no bell under the hidden selector').toBeVisible();

        await storage.set(hideList({ headerNotificationsBell: true }));
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expectSignedIn(page);

        await expect.poll(() => countVisible(page, NOTIFICATIONS_BELL)).toBe(0);
    });

    test('YT-HL-03 "Suggested Videos Grid" hides the home feed', async ({ page, storage }) => {
        await expectOptionHides(page, storage, 'homeFeedSuggestedVideosGrid', 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
            () => openYouTube(page, realUrl.home));
    });

    test('YT-HL-07 "Up-Next Sidebar" hides the watch page sidebar', async ({ page, storage }) => {
        const result = await firstSearchResult(page);

        await expectOptionHides(page, storage, 'watchPageUpNextSidebar', 'ytd-watch-next-secondary-results-renderer',
            () => openYouTube(page, result.href));
    });

    test('YT-HL-08 "Comments Section" hides the comments', async ({ page, storage }) => {
        const result = await firstSearchResult(page);

        await expectOptionHides(page, storage, 'watchPageCommentsSection', 'ytd-comments',
            () => openYouTube(page, result.href));
    });

    test('YT-HL-09 "Topic Chips" hides the filter chips of search results', async ({ page, storage }) => {
        await expectOptionHides(page, storage, 'searchResultsTopicChips', 'ytd-search ytd-search-header-renderer yt-chip-cloud-renderer',
            () => openYouTube(page, realUrl.search()));
    });
});

function countVisible(page: Page, selector: string): Promise<number> {
    return page.locator(selector).evaluateAll(elements => elements.filter(element => element.checkVisibility()).length);
}

/** Elements not hidden by CSS (display: none). Unlike checkVisibility, this also counts empty or not yet loaded sections. */
function countDisplayed(page: Page, selector: string): Promise<number> {
    return page.locator(selector).evaluateAll(elements => elements.filter(element => getComputedStyle(element).display !== 'none').length);
}
