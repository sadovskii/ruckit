import type { BrowserContext, Route } from '@playwright/test';

/*
 * Minimal YouTube pages for deterministic tests. Requests to www.youtube.com are intercepted and
 * answered with this markup, so the extension's content script is injected exactly as on YouTube.
 * The structure mirrors the selectors used in src/extension/black-list/pages/* - keep them in sync.
 * Every video gets data-e2e="video" and data-title so tests can find it regardless of YouTube markup.
 */

export interface Video {
    title: string;
    channel?: string;
}

const DEFAULT_CHANNEL = 'Some channel';

export const YOUTUBE_ORIGIN = 'https://www.youtube.com';

export const youtubeUrl = {
    home: () => `${YOUTUBE_ORIGIN}/`,
    search: (query: string) => `${YOUTUBE_ORIGIN}/results?search_query=${encodeURIComponent(query)}`,
    watch: (videoId = 'e2e-video') => `${YOUTUBE_ORIGIN}/watch?v=${videoId}`,
    premiere: (videoId = 'e2e-premiere') => `${YOUTUBE_ORIGIN}/watch?v=${videoId}&premiere=1`,
    channel: (handle = 'e2e-channel') => `${YOUTUBE_ORIGIN}/@${handle}`,
    shorts: (shortId = 'e2e-short') => `${YOUTUBE_ORIGIN}/shorts/${shortId}`,
    restricted: () => `${YOUTUBE_ORIGIN}/-rp`,
};

/** A Shorts player page (ShortPageRedirect looks for ytd-shorts). */
export function shortsPage(): string {
    return layout(`<ytd-page-manager><ytd-shorts data-e2e="shorts-player">Short video</ytd-shorts></ytd-page-manager>`);
}

export function searchResultsPage(videos: Video[], options: { shortsShelf?: boolean; notificationsBell?: boolean; channels?: string[] } = {}): string {
    const items = videos.map(video => `
        <ytd-video-renderer data-e2e="video" data-title="${attr(video.title)}">
            <a id="video-title" title="${attr(video.title)}">${text(video.title)}</a>
            <div id="channel-info">
                <a id="channel-thumbnail" href="/@channel"><img alt=""></a>
                <ytd-channel-name><a class="yt-simple-endpoint" href="/@channel">${text(video.channel ?? DEFAULT_CHANNEL)}</a></ytd-channel-name>
            </div>
        </ytd-video-renderer>`).join('');

    const shorts = options.shortsShelf
        ? `<ytd-reel-shelf-renderer data-e2e="shorts-shelf">Shorts</ytd-reel-shelf-renderer>`
        : '';

    const bell = options.notificationsBell
        ? `<ytd-notification-topbar-button-renderer data-e2e="notifications-bell">Notifications</ytd-notification-topbar-button-renderer>`
        : '';

    // channel results, e.g. when searching for a channel name
    const channels = (options.channels ?? []).map(name => `
        <ytd-channel-renderer data-e2e="channel-result" data-channel="${attr(name)}">
            <div id="info-section"><ytd-channel-name><div id="text">${text(name)}</div></ytd-channel-name></div>
        </ytd-channel-renderer>`).join('');

    return layout(`
        ${bell}
        <ytd-search>
            <ytd-section-list-renderer>
                <ytd-item-section-renderer>
                    <div id="contents">${shorts}${channels}${items}</div>
                </ytd-item-section-renderer>
            </ytd-section-list-renderer>
        </ytd-search>`);
}

export function homeFeedPage(videos: Video[]): string {
    const items = videos.map(video => `
        <ytd-rich-item-renderer data-e2e="video" data-title="${attr(video.title)}">
            <div id="content">
                <h3 class="yt-lockup-metadata-view-model__heading-reset">${text(video.title)}</h3>
                <yt-content-metadata-view-model>
                    <div class="ytContentMetadataViewModelMetadataRow">
                        <a class="ytAttributedStringLink" href="/@channel">${text(video.channel ?? DEFAULT_CHANNEL)}</a>
                    </div>
                </yt-content-metadata-view-model>
            </div>
        </ytd-rich-item-renderer>`).join('');

    return layout(`<ytd-rich-grid-renderer>${items}</ytd-rich-grid-renderer>`);
}

export function watchPage(video: Video, upNext: Video[] = []): string {
    const sidebar = upNext.map(item => `
        <yt-lockup-view-model data-e2e="video" data-title="${attr(item.title)}">
            <span class="yt-lockup-metadata-view-model__title">${text(item.title)}</span>
            <yt-content-metadata-view-model><span>${text(item.channel ?? DEFAULT_CHANNEL)}</span></yt-content-metadata-view-model>
        </yt-lockup-view-model>`).join('');

    return layout(`
        <ytd-page-manager>
            <ytd-watch-flexy>
                <ytd-watch-metadata>
                    <div id="title"><yt-formatted-string>${text(video.title)}</yt-formatted-string></div>
                    <div id="owner">
                        <ytd-video-owner-renderer>
                            <div id="upload-info">
                                <ytd-channel-name id="channel-name">
                                    <div id="text-container">
                                        <yt-formatted-string><a href="/@channel">${text(video.channel ?? DEFAULT_CHANNEL)}</a></yt-formatted-string>
                                    </div>
                                </ytd-channel-name>
                            </div>
                        </ytd-video-owner-renderer>
                    </div>
                </ytd-watch-metadata>
                <ytd-item-section-renderer>${sidebar}</ytd-item-section-renderer>
            </ytd-watch-flexy>
        </ytd-page-manager>`);
}

export function channelPage(channelName: string): string {
    return layout(`
        <ytd-page-manager>
            <ytd-browse page-subtype="channels" role="main">
                <yt-page-header-renderer>
                    <yt-dynamic-text-view-model><h1><span>${text(channelName)}</span></h1></yt-dynamic-text-view-model>
                    <yt-flexible-actions-view-model><button>Subscribe</button></yt-flexible-actions-view-model>
                </yt-page-header-renderer>
            </ytd-browse>
        </ytd-page-manager>`);
}

/**
 * Serves registered pages for www.youtube.com in the given browser context.
 * Unregistered paths get an empty 404 page (like the restricted page, which is a YouTube 404).
 */
export class YouTubeMock {
    private readonly pages = new Map<string, string>();
    private readonly pattern = `${YOUTUBE_ORIGIN}/**`;
    private readonly handler = (route: Route) => this.handle(route);

    constructor(private readonly context: BrowserContext) {}

    async start(): Promise<void> {
        await this.context.route(this.pattern, this.handler);
    }

    async stop(): Promise<void> {
        await this.context.unroute(this.pattern, this.handler);
    }

    /** Registers the html returned for a URL (matched by path, query is ignored). */
    serve(url: string, html: string): string {
        this.pages.set(new URL(url).pathname, html);

        return url;
    }

    private async handle(route: Route): Promise<void> {
        const request = route.request();
        const html = request.resourceType() === 'document' ? this.pages.get(new URL(request.url()).pathname) : undefined;

        if (html === undefined) {
            await route.fulfill({ status: 404, contentType: 'text/html', body: layout('<h1 data-e2e="not-found">404</h1>') });
            return;
        }

        await route.fulfill({ status: 200, contentType: 'text/html', body: html });
    }
}

function layout(body: string): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>YouTube (e2e mock)</title></head><body>${body}</body></html>`;
}

function text(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function attr(value: string): string {
    return text(value).replace(/"/g, '&quot;');
}
