import { BlackListStorage } from '../black-list-storage';
import { FeedPage } from './feed-page/feed-page';
import { SearchPage } from './search-page/search-page';
import { VideoPage } from './video-page/video-page';
import { VideoPageRedirect } from './video-page/video-page-redirect';
import { ChannelPageRedirect } from './channel-page/channel-page-redirect';
import { FakeChrome, flushStorageEvents, installFakeChrome } from '../testing/fake-chrome';
import { YouTubeDom } from '../testing/youtube-dom-fixtures';

/*
 * Behaviour of the "keywords and phrases" restriction as users experience it. Since the merge, words and
 * phrases are items of one list (blk/blkito), matched as a case-insensitive substring of the title.
 * Data saved before the merge (the old phrases list blph/blphito) must keep working for existing users.
 *
 * Every test starts from data as it is persisted in chrome.storage.sync, runs the real page handlers
 * against a YouTube-like DOM and checks what is hidden.
 */

// persisted storage keys (see src/app/shared/constants.ts) - this is user data, never rename
const KEYWORDS_AND_PHRASES = 'blk';
const KEYWORDS_AND_PHRASES_ON = 'blkito';
// old phrases list, merged into the keywords and phrases list on startup (kept to test data saved before the merge)
const LEGACY_PHRASES = 'blph';
const LEGACY_PHRASES_ON = 'blphito';
const CHANNELS = 'blch';
const CHANNELS_ON = 'blchito';

type StoredData = Record<string, unknown>;

interface Surface {
    name: string;
    /** Feed only filters when the channels restriction is turned on (see FeedPage.blackListRemoveElements). */
    requiresChannelsOn?: boolean;
    /** Redirect surfaces handle only the single opened video. */
    singleVideo?: boolean;
    /** Puts a video with the title on the page and returns a function telling whether it got hidden. */
    render(dom: YouTubeDom, title: string, fakeChrome: FakeChrome): () => boolean;
    run(storage: BlackListStorage): void;
}

const isRemoved = (element: HTMLElement) => () => !element.isConnected;
const isRedirected = (fakeChrome: FakeChrome) => () =>
    fakeChrome.sentMessages.some(message => (message as { restrictedPage?: boolean })?.restrictedPage === true);

const SURFACES: Surface[] = [
    {
        name: 'search results',
        render: (dom, title) => isRemoved(dom.addSearchVideo(title)),
        run: storage => new SearchPage(storage).blackListRemoveElements(),
    },
    {
        name: 'home feed',
        requiresChannelsOn: true,
        render: (dom, title) => isRemoved(dom.addFeedVideo(title)),
        run: storage => new FeedPage(storage).blackListRemoveElements(),
    },
    {
        name: 'watch page sidebar',
        render: (dom, title) => isRemoved(dom.addWatchSidebarVideo(title)),
        run: storage => new VideoPage(storage).blackListInjectAndRemoveElements(),
    },
    {
        name: 'watch page redirect',
        singleVideo: true,
        render: (dom, title, fakeChrome) => { dom.setWatchPage(title); return isRedirected(fakeChrome); },
        run: storage => new VideoPageRedirect(storage).videoPageRedirect(),
    },
];

interface Scenario {
    description: string;
    stored: StoredData;
    title: string;
    hidden: boolean;
}

const keywordsAndPhrasesOn = (keywordsAndPhrases: string[]): StoredData => ({ [KEYWORDS_AND_PHRASES]: keywordsAndPhrases, [KEYWORDS_AND_PHRASES_ON]: true });
const legacyPhrasesOn = (legacyPhrases: string[]): StoredData => ({ [LEGACY_PHRASES]: legacyPhrases, [LEGACY_PHRASES_ON]: true });

const SCENARIOS: Scenario[] = [
    // keywords
    { description: 'keyword matches a word of the title', stored: keywordsAndPhrasesOn(['cats']), title: 'Funny cats compilation', hidden: true },
    { description: 'keyword is case-insensitive (upper-case keyword)', stored: keywordsAndPhrasesOn(['CATS']), title: 'Funny cats compilation', hidden: true },
    { description: 'keyword is case-insensitive (upper-case title)', stored: keywordsAndPhrasesOn(['cats']), title: 'FUNNY CATS COMPILATION', hidden: true },
    { description: 'keyword is case-insensitive for cyrillic', stored: keywordsAndPhrasesOn(['кошки']), title: 'Смешные КОШКИ', hidden: true },
    { description: 'keyword matches the first word', stored: keywordsAndPhrasesOn(['funny']), title: 'Funny cats', hidden: true },
    { description: 'keyword matches a word with punctuation', stored: keywordsAndPhrasesOn(['cats']), title: 'I love cats!', hidden: true },
    { description: 'keyword matches part of a word', stored: keywordsAndPhrasesOn(['hate']), title: 'Whatever happens', hidden: true },
    { description: 'any of several keywords matches', stored: keywordsAndPhrasesOn(['dogs', 'cats']), title: 'Funny cats', hidden: true },
    { description: 'keyword not in the title', stored: keywordsAndPhrasesOn(['dogs']), title: 'Funny cats compilation', hidden: false },
    { description: 'empty keywords list', stored: keywordsAndPhrasesOn([]), title: 'Funny cats compilation', hidden: false },

    // phrases are items of the same "keywords and phrases" list
    { description: 'phrase matches the beginning of the title', stored: keywordsAndPhrasesOn(['How to']), title: 'How to cook pasta', hidden: true },
    { description: 'phrase matches the middle of the title', stored: keywordsAndPhrasesOn(['breaking news']), title: 'Today breaking news live', hidden: true },
    { description: 'phrase matches the whole title', stored: keywordsAndPhrasesOn(['cook pasta']), title: 'cook pasta', hidden: true },
    { description: 'phrase matches across parts of words', stored: keywordsAndPhrasesOn(['king new']), title: 'breaking news', hidden: true },
    { description: 'phrase matches cyrillic', stored: keywordsAndPhrasesOn(['как приготовить']), title: 'Рецепт: как приготовить пасту', hidden: true },
    { description: 'phrase is case-insensitive', stored: keywordsAndPhrasesOn(['How To Cook']), title: 'how to cook pasta', hidden: true },
    { description: 'phrase is case-insensitive for cyrillic', stored: keywordsAndPhrasesOn(['КАК ПРИГОТОВИТЬ']), title: 'как приготовить пасту', hidden: true },
    { description: 'words and phrases in one list', stored: keywordsAndPhrasesOn(['dogs', 'bad day']), title: 'What a bad day', hidden: true },
    { description: 'phrase words in a different order', stored: keywordsAndPhrasesOn(['news breaking']), title: 'Today breaking news', hidden: false },
    { description: 'phrase not in the title', stored: keywordsAndPhrasesOn(['bad day']), title: 'How to cook pasta', hidden: false },

    // data saved before the merge: the old separate phrases list (blph/blphito) still hides videos
    {
        description: 'old phrases list, title matches an old phrase',
        stored: { ...keywordsAndPhrasesOn(['cats']), ...legacyPhrasesOn(['bad day']) }, title: 'What a bad day', hidden: true,
    },
    {
        description: 'old phrases list on, keywords list off: old phrases still hide',
        stored: { [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, ...legacyPhrasesOn(['bad day']) }, title: 'What a bad day', hidden: true,
    },
    {
        description: 'old phrases list, same item in both lists',
        stored: { ...keywordsAndPhrasesOn(['cats']), ...legacyPhrasesOn(['cats']) }, title: 'Funny cats', hidden: true,
    },
    {
        description: 'old phrases list, title matches nothing',
        stored: { ...keywordsAndPhrasesOn(['cats']), ...legacyPhrasesOn(['bad day']) }, title: 'Great morning', hidden: false,
    },
    {
        description: 'old phrases list was case-sensitive, now case-insensitive',
        stored: legacyPhrasesOn(['Bad Day']), title: 'what a bad day', hidden: true,
    },

    // toggles
    {
        description: 'keywords turned off',
        stored: { [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false }, title: 'Funny cats', hidden: false,
    },
    {
        description: 'old phrases list turned off',
        stored: { [LEGACY_PHRASES]: ['bad day'], [LEGACY_PHRASES_ON]: false }, title: 'What a bad day', hidden: false,
    },
    {
        description: 'keywords and old phrases lists both turned off',
        stored: { [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: ['bad day'], [LEGACY_PHRASES_ON]: false },
        title: 'Funny cats on a bad day', hidden: false,
    },
    {
        description: 'keywords list without a stored toggle (never turned on)',
        stored: { [KEYWORDS_AND_PHRASES]: ['cats'] }, title: 'Funny cats', hidden: false,
    },
    {
        description: 'old phrases list without a stored toggle (never turned on)',
        stored: { [LEGACY_PHRASES]: ['bad day'] }, title: 'What a bad day', hidden: false,
    },
    { description: 'nothing stored (new user)', stored: {}, title: 'Funny cats', hidden: false },
];

describe('Black list: keywords and phrases', () => {
    let fakeChrome: FakeChrome;
    let dom: YouTubeDom;

    async function createStorage(stored: StoredData): Promise<BlackListStorage> {
        fakeChrome = installFakeChrome(stored);
        const storage = new BlackListStorage();
        await storage.init();

        return storage;
    }

    beforeEach(() => {
        dom = new YouTubeDom();
    });

    afterEach(() => {
        dom.destroy();
        fakeChrome?.restore();
    });

    SURFACES.forEach(surface => {
        describe(`on ${surface.name}`, () => {
            SCENARIOS.forEach(scenario => {
                it(`${scenario.hidden ? 'hides' : 'shows'} the video: ${scenario.description}`, async () => {
                    const stored = surface.requiresChannelsOn
                        ? { [CHANNELS]: [], [CHANNELS_ON]: true, ...scenario.stored }
                        : scenario.stored;
                    const storage = await createStorage(stored);
                    const isHidden = surface.render(dom, scenario.title, fakeChrome);

                    surface.run(storage);

                    expect(isHidden()).withContext(`title "${scenario.title}"`).toBe(scenario.hidden);
                });
            });

            if (surface.singleVideo) return;

            it('hides only the matching videos among several', async () => {
                const stored = {
                    ...(surface.requiresChannelsOn ? { [CHANNELS]: [], [CHANNELS_ON]: true } : {}),
                    ...keywordsAndPhrasesOn(['cats']),
                    ...legacyPhrasesOn(['bad day']),
                };
                const storage = await createStorage(stored);

                const cats = surface.render(dom, 'Funny cats', fakeChrome);
                const badDay = surface.render(dom, 'What a bad day', fakeChrome);
                const neutral = surface.render(dom, 'Great morning', fakeChrome);
                const anotherNeutral = surface.render(dom, 'Cooking pasta', fakeChrome);

                surface.run(storage);

                expect(cats()).toBe(true);
                expect(badDay()).toBe(true);
                expect(neutral()).toBe(false);
                expect(anotherNeutral()).toBe(false);
            });
        });
    });

    describe('live updates from the settings page', () => {
        it('starts hiding by a keyword added after the page was loaded', async () => {
            const storage = await createStorage(keywordsAndPhrasesOn([]));
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS_AND_PHRASES]: ['cats'] });
            await flushStorageEvents();
            new SearchPage(storage).blackListRemoveElements();

            expect(isHidden()).toBe(true);
        });

        it('stops hiding by keywords after they were turned off', async () => {
            const storage = await createStorage(keywordsAndPhrasesOn(['cats']));
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS_AND_PHRASES_ON]: false });
            await flushStorageEvents();
            new SearchPage(storage).blackListRemoveElements();

            expect(isHidden()).toBe(false);
        });

        it('starts hiding by keywords after they were turned on', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false });
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS_AND_PHRASES_ON]: true });
            await flushStorageEvents();
            new SearchPage(storage).blackListRemoveElements();

            expect(isHidden()).toBe(true);
        });
    });

    describe('home feed', () => {
        // pre-existing behaviour: the feed is filtered only while the channels restriction is on
        it('does not filter by keywords or phrases while channels restriction is off', async () => {
            const storage = await createStorage({
                [CHANNELS_ON]: false,
                ...keywordsAndPhrasesOn(['cats']),
                ...legacyPhrasesOn(['bad day']),
            });
            const cats = isRemoved(dom.addFeedVideo('Funny cats'));
            const badDay = isRemoved(dom.addFeedVideo('What a bad day'));

            new FeedPage(storage).blackListRemoveElements();

            expect(cats()).toBe(false);
            expect(badDay()).toBe(false);
        });
    });

    describe('channel page redirect', () => {
        const channelsOn: StoredData = { [CHANNELS]: [], [CHANNELS_ON]: true };

        async function openChannel(stored: StoredData, channelName: string): Promise<boolean> {
            const storage = await createStorage(stored);
            dom.setChannelPage(channelName);
            new ChannelPageRedirect(storage).channelPageRedirect();

            return isRedirected(fakeChrome)();
        }

        it('redirects when a keyword matches the channel name', async () => {
            expect(await openChannel({ ...channelsOn, ...keywordsAndPhrasesOn(['cats']) }, 'Funny Cats TV')).toBe(true);
        });

        it('redirects when a phrase matches the channel name', async () => {
            expect(await openChannel({ ...channelsOn, ...legacyPhrasesOn(['Cats TV']) }, 'Funny Cats TV')).toBe(true);
        });

        it('does not redirect when nothing matches the channel name', async () => {
            expect(await openChannel({ ...channelsOn, ...keywordsAndPhrasesOn(['dogs']), ...legacyPhrasesOn(['bad day']) }, 'Funny Cats TV')).toBe(false);
        });

        it('redirects when the channel itself is blocked', async () => {
            expect(await openChannel({ [CHANNELS]: ['Funny Cats TV'], [CHANNELS_ON]: true }, 'Funny Cats TV')).toBe(true);
        });

        it('does nothing while channels restriction is off', async () => {
            expect(await openChannel({ [CHANNELS_ON]: false, ...keywordsAndPhrasesOn(['cats']) }, 'Funny Cats TV')).toBe(false);
        });

        // pre-existing behaviour: keyword/phrase toggles are not checked on the channel page
        it('checks keywords and phrases even when they are turned off', async () => {
            const stored = { ...channelsOn, [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: ['bad day'], [LEGACY_PHRASES_ON]: false };

            expect(await openChannel(stored, 'Funny Cats TV')).toBe(true);
        });
    });
});

function surfaceByName(name: string): Surface {
    return SURFACES.find(surface => surface.name === name)!;
}
