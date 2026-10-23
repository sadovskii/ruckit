import { BlackListStorage } from '../black-list-storage';
import { FeedPage } from './feed-page/feed-page';
import { SearchPage } from './search-page/search-page';
import { VideoPage } from './video-page/video-page';
import { VideoPageRedirect } from './video-page/video-page-redirect';
import { ChannelPageRedirect } from './channel-page/channel-page-redirect';
import { FakeChrome, flushStorageEvents, installFakeChrome } from '../testing/fake-chrome';
import { YouTubeDom } from '../testing/youtube-dom-fixtures';

/*
 * Behaviour of keyword and phrase restrictions as users experience it.
 *
 * Every test starts from data as it is persisted in chrome.storage.sync (the real keys users
 * already have), runs the real page handlers against a YouTube-like DOM and checks what is hidden.
 * The tests intentionally avoid keyword/phrase specific APIs so they stay valid when the
 * implementation of the lists changes (e.g. when phrases are merged into keywords).
 */

// persisted storage keys (see src/app/shared/constants.ts) - this is user data, never rename
const KEYWORDS = 'blk';
const KEYWORDS_ON = 'blkito';
const PHRASES = 'blph';
const PHRASES_ON = 'blphito';
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

const keywordsOn = (keywords: string[]): StoredData => ({ [KEYWORDS]: keywords, [KEYWORDS_ON]: true });
const phrasesOn = (phrases: string[]): StoredData => ({ [PHRASES]: phrases, [PHRASES_ON]: true });

const SCENARIOS: Scenario[] = [
    // keywords
    { description: 'keyword matches a word of the title', stored: keywordsOn(['cats']), title: 'Funny cats compilation', hidden: true },
    { description: 'keyword is case-insensitive (upper-case keyword)', stored: keywordsOn(['CATS']), title: 'Funny cats compilation', hidden: true },
    { description: 'keyword is case-insensitive (upper-case title)', stored: keywordsOn(['cats']), title: 'FUNNY CATS COMPILATION', hidden: true },
    { description: 'keyword is case-insensitive for cyrillic', stored: keywordsOn(['кошки']), title: 'Смешные КОШКИ', hidden: true },
    { description: 'keyword matches the first word', stored: keywordsOn(['funny']), title: 'Funny cats', hidden: true },
    { description: 'keyword matches a word with punctuation', stored: keywordsOn(['cats']), title: 'I love cats!', hidden: true },
    { description: 'keyword matches part of a word', stored: keywordsOn(['hate']), title: 'Whatever happens', hidden: true },
    { description: 'any of several keywords matches', stored: keywordsOn(['dogs', 'cats']), title: 'Funny cats', hidden: true },
    { description: 'keyword not in the title', stored: keywordsOn(['dogs']), title: 'Funny cats compilation', hidden: false },
    { description: 'empty keywords list', stored: keywordsOn([]), title: 'Funny cats compilation', hidden: false },

    // phrases
    { description: 'phrase matches the beginning of the title', stored: phrasesOn(['How to']), title: 'How to cook pasta', hidden: true },
    { description: 'phrase matches the middle of the title', stored: phrasesOn(['breaking news']), title: 'Today breaking news live', hidden: true },
    { description: 'phrase matches the whole title', stored: phrasesOn(['cook pasta']), title: 'cook pasta', hidden: true },
    { description: 'phrase matches across parts of words', stored: phrasesOn(['king new']), title: 'breaking news', hidden: true },
    { description: 'phrase matches a single word', stored: phrasesOn(['pasta']), title: 'How to cook pasta', hidden: true },
    { description: 'phrase matches cyrillic', stored: phrasesOn(['как приготовить']), title: 'Рецепт: как приготовить пасту', hidden: true },
    { description: 'any of several phrases matches', stored: phrasesOn(['bad day', 'cook pasta']), title: 'How to cook pasta', hidden: true },
    { description: 'phrase words in a different order', stored: phrasesOn(['news breaking']), title: 'Today breaking news', hidden: false },
    { description: 'phrase not in the title', stored: phrasesOn(['bad day']), title: 'How to cook pasta', hidden: false },
    { description: 'empty phrases list', stored: phrasesOn([]), title: 'How to cook pasta', hidden: false },

    // both lists in use
    {
        description: 'both lists on, title matches only a keyword',
        stored: { ...keywordsOn(['cats']), ...phrasesOn(['bad day']) }, title: 'Funny cats', hidden: true,
    },
    {
        description: 'both lists on, title matches only a phrase',
        stored: { ...keywordsOn(['cats']), ...phrasesOn(['bad day']) }, title: 'What a bad day', hidden: true,
    },
    {
        description: 'both lists on, same item in both lists',
        stored: { ...keywordsOn(['cats']), ...phrasesOn(['cats']) }, title: 'Funny cats', hidden: true,
    },
    {
        description: 'both lists on, title matches nothing',
        stored: { ...keywordsOn(['cats']), ...phrasesOn(['bad day']) }, title: 'Great morning', hidden: false,
    },

    // toggles
    {
        description: 'keywords turned off',
        stored: { [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false }, title: 'Funny cats', hidden: false,
    },
    {
        description: 'phrases turned off',
        stored: { [PHRASES]: ['bad day'], [PHRASES_ON]: false }, title: 'What a bad day', hidden: false,
    },
    {
        description: 'both lists turned off',
        stored: { [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false, [PHRASES]: ['bad day'], [PHRASES_ON]: false },
        title: 'Funny cats on a bad day', hidden: false,
    },
    {
        description: 'keywords list without a stored toggle (never turned on)',
        stored: { [KEYWORDS]: ['cats'] }, title: 'Funny cats', hidden: false,
    },
    {
        description: 'phrases list without a stored toggle (never turned on)',
        stored: { [PHRASES]: ['bad day'] }, title: 'What a bad day', hidden: false,
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
                    ...keywordsOn(['cats']),
                    ...phrasesOn(['bad day']),
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
            const storage = await createStorage(keywordsOn([]));
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS]: ['cats'] });
            await flushStorageEvents();
            new SearchPage(storage).blackListRemoveElements();

            expect(isHidden()).toBe(true);
        });

        it('stops hiding by keywords after they were turned off', async () => {
            const storage = await createStorage(keywordsOn(['cats']));
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS_ON]: false });
            await flushStorageEvents();
            new SearchPage(storage).blackListRemoveElements();

            expect(isHidden()).toBe(false);
        });

        it('starts hiding by keywords after they were turned on', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false });
            storage.initHandler();
            const isHidden = surfaceByName('search results').render(dom, 'Funny cats', fakeChrome);

            await chrome.storage.sync.set({ [KEYWORDS_ON]: true });
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
                ...keywordsOn(['cats']),
                ...phrasesOn(['bad day']),
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
            expect(await openChannel({ ...channelsOn, ...keywordsOn(['cats']) }, 'Funny Cats TV')).toBe(true);
        });

        it('redirects when a phrase matches the channel name', async () => {
            expect(await openChannel({ ...channelsOn, ...phrasesOn(['Cats TV']) }, 'Funny Cats TV')).toBe(true);
        });

        it('does not redirect when nothing matches the channel name', async () => {
            expect(await openChannel({ ...channelsOn, ...keywordsOn(['dogs']), ...phrasesOn(['bad day']) }, 'Funny Cats TV')).toBe(false);
        });

        it('redirects when the channel itself is blocked', async () => {
            expect(await openChannel({ [CHANNELS]: ['Funny Cats TV'], [CHANNELS_ON]: true }, 'Funny Cats TV')).toBe(true);
        });

        it('does nothing while channels restriction is off', async () => {
            expect(await openChannel({ [CHANNELS_ON]: false, ...keywordsOn(['cats']) }, 'Funny Cats TV')).toBe(false);
        });

        // pre-existing behaviour: keyword/phrase toggles are not checked on the channel page
        it('checks keywords and phrases even when they are turned off', async () => {
            const stored = { ...channelsOn, [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false, [PHRASES]: ['bad day'], [PHRASES_ON]: false };

            expect(await openChannel(stored, 'Funny Cats TV')).toBe(true);
        });
    });
});

function surfaceByName(name: string): Surface {
    return SURFACES.find(surface => surface.name === name)!;
}
