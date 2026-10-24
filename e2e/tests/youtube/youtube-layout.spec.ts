import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures';
import { expectSignedIn, firstSearchResult, openYouTube, realUrl } from '../../support/youtube-real';

/*
 * Detects YouTube HTML changes that break the extension: every selector the extension relies on must
 * still match on the real page. A failing selector here means the corresponding extension code
 * (see "usedBy") has to be updated. Soft assertions report all broken selectors of a page at once.
 * The home page needs a signed-in account (YouTube shows no feed signed out).
 */

interface SelectorCheck {
    selector: string;
    usedBy: string;
}

const SEARCH_PAGE: SelectorCheck[] = [
    { selector: 'ytd-video-renderer', usedBy: 'pages/search-page/search-page.ts (results)' },
    { selector: 'ytd-video-renderer #video-title', usedBy: 'search-page.ts (title for keywords/phrases)' },
    { selector: 'ytd-video-renderer #channel-info #channel-thumbnail', usedBy: 'search-page.ts (button position)' },
    { selector: 'ytd-video-renderer #channel-info ytd-channel-name .yt-simple-endpoint', usedBy: 'search-page.ts (channel name)' },
    { selector: 'ytd-reel-shelf-renderer, ytd-search grid-shelf-view-model:has(ytm-shorts-lockup-view-model)', usedBy: 'styles/hide-list/general-hide-shorts.css' },
    { selector: 'a[title="Shorts"]', usedBy: 'styles/hide-list/general-hide-shorts.css (sidebar link)' },
];

const HOME_PAGE: SelectorCheck[] = [
    { selector: 'ytd-rich-item-renderer', usedBy: 'pages/feed-page/feed-page.ts (feed items)' },
    { selector: 'ytd-rich-item-renderer .ytLockupMetadataViewModelHeadingReset, ytd-rich-item-renderer .yt-lockup-metadata-view-model__heading-reset', usedBy: 'feed-page.ts (title)' },
    { selector: 'ytd-rich-item-renderer yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow a.ytAttributedStringLink', usedBy: 'feed-page.ts (channel name, button position)' },
    { selector: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer', usedBy: 'styles/hide-list/home-feed-suggested-videos-grid.css' },
    { selector: 'ytd-notification-topbar-button-renderer', usedBy: 'styles/hide-list/header-notifications-bell.css' },
];

const WATCH_PAGE: SelectorCheck[] = [
    { selector: 'ytd-page-manager > ytd-watch-flexy', usedBy: 'pages/video-page/video-page-redirect.ts' },
    { selector: 'ytd-watch-metadata #title yt-formatted-string', usedBy: 'video-page-redirect.ts (title)' },
    { selector: 'ytd-watch-metadata ytd-video-owner-renderer ytd-channel-name yt-formatted-string a', usedBy: 'video-page-redirect.ts (channel name)' },
    { selector: '#owner ytd-video-owner-renderer #upload-info #channel-name #text-container a', usedBy: 'pages/video-page/video-page.ts (button next to the channel)' },
    { selector: 'ytd-item-section-renderer yt-lockup-view-model', usedBy: 'video-page.ts ("up next" items)' },
    { selector: 'ytd-item-section-renderer yt-lockup-view-model .yt-lockup-metadata-view-model__title', usedBy: 'video-page.ts ("up next" title for keywords/phrases)' },
    { selector: 'ytd-item-section-renderer yt-lockup-view-model yt-content-metadata-view-model span', usedBy: 'video-page.ts ("up next" channel name)' },
    { selector: 'ytd-watch-next-secondary-results-renderer', usedBy: 'styles/hide-list/watch-page-up-next-sidebar.css' },
];

const CHANNEL_PAGE: SelectorCheck[] = [
    { selector: 'ytd-page-manager ytd-browse[page-subtype="channels"][role="main"]', usedBy: 'pages/channel-page/channel-page-redirect.ts' },
    { selector: 'yt-page-header-renderer yt-dynamic-text-view-model h1 span', usedBy: 'channel-page-redirect.ts / channel-page.ts (channel name)' },
    { selector: 'yt-page-header-renderer yt-flexible-actions-view-model', usedBy: 'pages/channel-page/channel-page.ts (button position)' },
];

test.describe('YouTube layout still matches the extension selectors', () => {
    // all extension options off: e.g. "hide home feed" or blocked channels would remove the very elements checked here
    test.beforeEach(async ({ storage }) => {
        await storage.reset({});
    });

    test('search page', async ({ page }) => {
        await openYouTube(page, realUrl.search());
        await expectSelectors(page, SEARCH_PAGE);
    });

    test('home page', async ({ page }) => {
        await openYouTube(page, realUrl.home);
        await expectSignedIn(page);
        await expectSelectors(page, HOME_PAGE);
    });

    test('watch page', async ({ page }) => {
        const result = await firstSearchResult(page);
        await openYouTube(page, result.href);
        await expectSelectors(page, WATCH_PAGE);
    });

    test('channel page', async ({ page }) => {
        const result = await firstSearchResult(page);
        await openYouTube(page, result.channelHref);
        await expectSelectors(page, CHANNEL_PAGE);
    });
});

async function expectSelectors(page: Page, checks: SelectorCheck[]): Promise<void> {
    // the first selector of each page is its main content; wait for it before checking the rest
    await page.locator(checks[0].selector).first().waitFor({ state: 'attached', timeout: 30_000 }).catch(() => undefined);

    for (const { selector, usedBy } of checks) {
        await expect.soft(page.locator(selector).first(), `"${selector}" not found - used by ${usedBy}`).toBeAttached({ timeout: 10_000 });
    }
}
