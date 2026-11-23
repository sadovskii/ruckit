import { STORAGE_YOUTUBE_THEME_ID } from "src/app/shared/constants";

export type YouTubeTheme = 'dark' | 'light';

type ThemeStorage = Pick<chrome.storage.StorageArea, 'get' | 'set'>;

/**
 * Theme YouTube is showing in the given document.
 * YouTube marks its dark theme with the `dark` attribute on <html> (this also covers the "Device theme" option).
 * Light has no marker of its own, so it is reported only once the YouTube app element exists; otherwise
 * (embeds, a page that is still loading) the theme is unknown and null is returned.
 */
export function detectYouTubeTheme(doc: Document): YouTubeTheme | null {
    if (doc.documentElement.hasAttribute('dark')) {
        return 'dark';
    }

    return doc.querySelector('ytd-app') ? 'light' : null;
}

/** Remembers the YouTube theme so pages the extension builds on top of YouTube's static pages can match it. */
export class YouTubeThemeRecorder {
    private lastRecorded: YouTubeTheme | null = null;

    constructor(
        private readonly doc: Document,
        private readonly storage: ThemeStorage = chrome.storage.local) {
    }

    /** Writes the theme only when it differs from the one already written by this page. */
    async sync(): Promise<void> {
        const theme = detectYouTubeTheme(this.doc);

        if (!theme || theme === this.lastRecorded) {
            return;
        }

        this.lastRecorded = theme;
        await this.storage.set({ [STORAGE_YOUTUBE_THEME_ID]: theme });
    }
}

/** The theme YouTube was last seen with, or null if the user has not opened YouTube yet. */
export async function readRecordedYouTubeTheme(storage: ThemeStorage = chrome.storage.local): Promise<YouTubeTheme | null> {
    const stored = await storage.get(STORAGE_YOUTUBE_THEME_ID);
    const theme = stored[STORAGE_YOUTUBE_THEME_ID];

    return theme === 'dark' || theme === 'light' ? theme : null;
}
