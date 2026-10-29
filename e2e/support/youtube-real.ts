import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/*
 * Helpers for tests on the real youtube.com. Content changes every day, so tests read the titles that are
 * actually shown and derive keywords/phrases from them instead of using fixed values.
 * The home feed and the notifications bell need a signed-in account: sign in once in the test window.
 */

export const SEARCH_QUERY = 'cat videos';

export const realUrl = {
    home: 'https://www.youtube.com/',
    search: (query = SEARCH_QUERY) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
};

/** A list of videos on a page: the item element and its title element. */
export interface VideoList {
    name: string;
    item: string;
    title: string;
}

// Title selectors are the test's own robust ones: tests must fail because the extension doesn't hide
// a video, not because the test can't read a title. The extension's own selectors are checked in youtube-layout.spec.ts.
export const SEARCH_RESULTS: VideoList = {
    name: 'search results',
    item: 'ytd-video-renderer',
    title: '#video-title',
};

// The home feed also contains items the extension doesn't read (YouTube Playables, Shorts shelves, Mixes, ads);
// only video items with the title class the extension uses are checked here (see YT-KW-E15).
export const HOME_FEED: VideoList = {
    name: 'home feed',
    item: 'ytd-rich-item-renderer:has(.ytLockupMetadataViewModelHeadingReset, .yt-lockup-metadata-view-model__heading-reset)',
    title: '.ytLockupMetadataViewModelHeadingReset, .yt-lockup-metadata-view-model__heading-reset',
};

export const UP_NEXT: VideoList = {
    name: '"up next" on the watch page',
    item: 'ytd-item-section-renderer yt-lockup-view-model',
    title: '.ytLockupMetadataViewModelTitle, .yt-lockup-metadata-view-model__title, h3',
};

/** Opens a YouTube page; accepts the cookie consent page if YouTube shows one (every test profile is new). */
export async function openYouTube(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (new URL(page.url()).hostname.startsWith('consent.')) {
        await page.getByRole('button', { name: /accept all|принять все/i }).first().click();
        await page.waitForURL(/^https:\/\/www\.youtube\.com\//);
    }

    expect(new URL(page.url()).hostname, 'YouTube redirected away from youtube.com').toBe('www.youtube.com');
}

/** The home feed and the notifications bell only exist for a signed-in user. */
export async function expectSignedIn(page: Page): Promise<void> {
    const signedIn = await page.locator('#avatar-btn').first().waitFor({ timeout: 15_000 }).then(() => true, () => false);
    const project = test.info().project.name;

    expect(signedIn, `Not signed in to YouTube in the ${project} window. Sign in there (run "npm run e2e:open:${project}" if it's closed).`).toBe(true);
}

export async function waitForVideos(page: Page, list: VideoList): Promise<void> {
    await expect(page.locator(list.item).first(), `no ${list.name} found`).toBeVisible({ timeout: 30_000 });
}

export function readTitles(page: Page, list: VideoList): Promise<string[]> {
    return page.locator(list.item).evaluateAll((items, titleSelector) => items
        .map(item => item.querySelector(titleSelector)?.textContent?.trim() ?? '')
        .filter(title => title.length > 0), list.title);
}

export function countVideos(page: Page, list: VideoList): Promise<number> {
    return page.locator(list.item).count();
}

/** Counts videos whose title contains a black-list item (a word or a phrase) like the extension does: ignoring case. */
export function countMatching(page: Page, list: VideoList, item: string): Promise<number> {
    return page.locator(list.item).evaluateAll((items, { titleSelector, item }) => items.filter(element => {
        const title = element.querySelector(titleSelector)?.textContent?.trim() ?? '';

        return title.toLocaleLowerCase().includes(item.toLocaleLowerCase());
    }).length, { titleSelector: list.title, item });
}

/**
 * A word that appears in some (but not all) titles, so filtering hides some videos and keeps others.
 * Words of `avoid` are skipped (e.g. the title of the opened video, which would otherwise be redirected away).
 */
export function pickKeyword(titles: string[], avoid = ''): string {
    const lowerTitles = titles.map(title => title.toLocaleLowerCase());
    const lowerAvoid = avoid.toLocaleLowerCase();
    const words = new Set(lowerTitles.flatMap(title => title.match(/\p{L}{5,}/gu) ?? []).filter(word => !lowerAvoid.includes(word)));

    return pickMostCommon([...words], word => lowerTitles.filter(title => title.includes(word)).length, titles.length, 'keyword');
}

/** Two consecutive words of a title that appear in some (but not all) titles. */
export function pickPhrase(titles: string[]): string {
    const phrases = new Set(titles.flatMap(title => {
        const words = title.split(/\s+/);
        return words.slice(1)
            .map((word, index) => `${words[index]} ${word}`)
            .filter(phrase => /\p{L}{3,}.*\s.*\p{L}{3,}/u.test(phrase));
    }));

    return pickMostCommon([...phrases], phrase => titles.filter(title => title.toLocaleLowerCase().includes(phrase.toLocaleLowerCase())).length, titles.length, 'phrase');
}

function pickMostCommon(candidates: string[], count: (candidate: string) => number, total: number, kind: string): string {
    const scored = candidates
        .map(candidate => ({ candidate, matches: count(candidate) }))
        .filter(({ matches }) => matches >= 1 && matches < total)
        .sort((a, b) => b.matches - a.matches);

    expect(scored.length, `could not pick a ${kind} from ${total} titles`).toBeGreaterThan(0);

    return scored[0].candidate;
}

export interface SearchResult {
    title: string;
    href: string;
    channelName: string;
    channelHref: string;
}

/** Opens the search results and returns the first video that belongs to a single channel (not a collaboration). */
export async function firstSearchResult(page: Page, query = SEARCH_QUERY): Promise<SearchResult> {
    await openYouTube(page, realUrl.search(query));
    await waitForVideos(page, SEARCH_RESULTS);

    const result = await page.locator(SEARCH_RESULTS.item).evaluateAll(items => items
        .map(item => {
            const channelLink = item.querySelector('#channel-info ytd-channel-name a.yt-simple-endpoint[href]');

            return {
                title: item.querySelector('#video-title')?.textContent?.trim() ?? '',
                href: item.querySelector('a#video-title, a#thumbnail')?.getAttribute('href') ?? '',
                channelName: channelLink?.textContent?.trim() ?? '',
                channelHref: channelLink?.getAttribute('href') ?? '',
            };
        })
        .find(video => video.title && video.href && video.channelName && video.channelHref));

    expect(result, 'no search result with a title, a video link and a single channel link').toBeTruthy();

    return {
        ...result!,
        href: new URL(result!.href, realUrl.home).toString(),
        channelHref: new URL(result!.channelHref, realUrl.home).toString(),
    };
}
