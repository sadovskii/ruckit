import { applyBlockedPageTheme } from './blocked-page-theme';
import { detectYouTubeTheme, readRecordedYouTubeTheme, YouTubeThemeRecorder } from './youtube-theme';

/*
 * The blocked page is YouTube's always-light 404 page. To match YouTube, the heartbeat script records the theme
 * on regular YouTube pages and the blocked page reads it back and repaints itself.
 */

const THEME_KEY = 'youtube-theme';

function youtubePage(options: { dark?: boolean; app?: boolean }): Document {
    const doc = document.implementation.createHTMLDocument('YouTube');
    if (options.dark) doc.documentElement.setAttribute('dark', '');
    if (options.app ?? true) doc.body.appendChild(doc.createElement('ytd-app'));
    return doc;
}

function fakeStorage(initial: Record<string, unknown> = {}) {
    const store: Record<string, unknown> = { ...initial };
    const setCalls: Record<string, unknown>[] = [];
    return {
        store,
        setCalls,
        get: async (key: string) => (key in store ? { [key]: store[key] } : {}),
        set: async (items: Record<string, unknown>) => { setCalls.push(items); Object.assign(store, items); },
    } as any;
}

describe('YouTube theme', () => {
    describe('detectYouTubeTheme', () => {
        it('is dark when YouTube marks <html> as dark', () => expect(detectYouTubeTheme(youtubePage({ dark: true }))).toBe('dark'));

        it('is light for the YouTube app without the dark marker', () => expect(detectYouTubeTheme(youtubePage({}))).toBe('light'));

        it('is unknown when the YouTube app has not loaded (embed, loading page, 404 page)', () =>
            expect(detectYouTubeTheme(youtubePage({ app: false }))).toBeNull());
    });

    describe('YouTubeThemeRecorder', () => {
        it('records the dark theme', async () => {
            const storage = fakeStorage();
            await new YouTubeThemeRecorder(youtubePage({ dark: true }), storage).sync();

            expect(storage.store[THEME_KEY]).toBe('dark');
        });

        it('records a switch of the theme', async () => {
            const doc = youtubePage({});
            const storage = fakeStorage();
            const recorder = new YouTubeThemeRecorder(doc, storage);

            await recorder.sync();
            doc.documentElement.setAttribute('dark', '');
            await recorder.sync();

            expect(storage.store[THEME_KEY]).toBe('dark');
        });

        it('writes to storage only when the theme changes', async () => {
            const storage = fakeStorage();
            const recorder = new YouTubeThemeRecorder(youtubePage({ dark: true }), storage);

            await recorder.sync();
            await recorder.sync();
            await recorder.sync();

            expect(storage.setCalls.length).toBe(1);
        });

        it('keeps the recorded theme when the current page does not show the theme', async () => {
            const storage = fakeStorage({ [THEME_KEY]: 'dark' });
            await new YouTubeThemeRecorder(youtubePage({ app: false }), storage).sync();

            expect(storage.store[THEME_KEY]).toBe('dark');
            expect(storage.setCalls.length).toBe(0);
        });
    });

    describe('readRecordedYouTubeTheme', () => {
        it('returns the recorded theme', async () => expect(await readRecordedYouTubeTheme(fakeStorage({ [THEME_KEY]: 'dark' }))).toBe('dark'));

        it('returns null when nothing is recorded', async () => expect(await readRecordedYouTubeTheme(fakeStorage())).toBeNull());

        it('ignores an unexpected value', async () => expect(await readRecordedYouTubeTheme(fakeStorage({ [THEME_KEY]: 'blue' }))).toBeNull());
    });

    describe('applyBlockedPageTheme', () => {
        const blockedPage = () => {
            const outer = document.implementation.createHTMLDocument('404');
            const inner = document.implementation.createHTMLDocument('frame');
            return { outer, inner };
        };

        it('repaints the page for the dark theme', () => {
            const { outer, inner } = blockedPage();
            applyBlockedPageTheme(outer, inner, 'dark');

            expect(outer.documentElement.style.backgroundColor).toBe('rgb(15, 15, 15)');
            expect(inner.head.querySelector('style')?.textContent).toContain('#0f0f0f');
        });

        for (const theme of ['light', null] as const) {
            it(`leaves YouTube's own light page untouched for ${theme}`, () => {
                const { outer, inner } = blockedPage();
                applyBlockedPageTheme(outer, inner, theme);

                expect(outer.documentElement.getAttribute('style')).toBeNull();
                expect(inner.head.querySelector('style')).toBeNull();
            });
        }
    });
});
