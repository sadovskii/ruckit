/**
 * Minimal YouTube DOM structures matching the selectors used by the black list page handlers.
 * Keep in sync with the selectors in src/extension/black-list/pages/*.
 */

export class YouTubeDom {
    private readonly root: HTMLElement;

    constructor() {
        this.root = document.createElement('div');
        this.root.setAttribute('data-test-root', 'youtube');
        document.body.appendChild(this.root);
    }

    destroy(): void {
        this.root.remove();
    }

    /** Search results video card (SearchPage). */
    addSearchVideo(title: string, channelName = 'Some channel'): HTMLElement {
        return this.append(`
            <ytd-video-renderer>
                <div id="channel-info">
                    <ytd-channel-name><a class="yt-simple-endpoint">${escapeHtml(channelName)}</a></ytd-channel-name>
                </div>
                <a id="video-title">  ${escapeHtml(title)}  </a>
            </ytd-video-renderer>`);
    }

    /** Home feed video card (FeedPage). */
    addFeedVideo(title: string, channelName = 'Some channel'): HTMLElement {
        return this.append(`
            <ytd-rich-item-renderer>
                <div id="content">
                    <h3 class="yt-lockup-metadata-view-model__heading-reset">  ${escapeHtml(title)}  </h3>
                    <yt-content-metadata-view-model>
                        <div class="ytContentMetadataViewModelMetadataRow">
                            <a class="ytAttributedStringLink">${escapeHtml(channelName)}</a>
                        </div>
                    </yt-content-metadata-view-model>
                </div>
            </ytd-rich-item-renderer>`);
    }

    /** "Up next" sidebar item on the watch page (VideoPage). */
    addWatchSidebarVideo(title: string): HTMLElement {
        let section = this.root.querySelector('ytd-item-section-renderer') as HTMLElement | null;

        if (!section) {
            section = this.append('<ytd-item-section-renderer></ytd-item-section-renderer>');
        }

        const template = document.createElement('template');
        template.innerHTML = `
            <yt-lockup-view-model>
                <span class="yt-lockup-metadata-view-model__title">  ${escapeHtml(title)}  </span>
            </yt-lockup-view-model>`.trim();
        const item = template.content.firstElementChild as HTMLElement;
        section.appendChild(item);

        return item;
    }

    /** Currently opened video on the watch page (VideoPageRedirect). */
    setWatchPage(title: string, channelName = 'Some channel'): void {
        this.append(`
            <ytd-page-manager>
                <ytd-watch-flexy>
                    <ytd-watch-metadata>
                        <div id="title"><yt-formatted-string>  ${escapeHtml(title)}  </yt-formatted-string></div>
                        <ytd-video-owner-renderer>
                            <ytd-channel-name><yt-formatted-string><a>${escapeHtml(channelName)}</a></yt-formatted-string></ytd-channel-name>
                        </ytd-video-owner-renderer>
                    </ytd-watch-metadata>
                </ytd-watch-flexy>
            </ytd-page-manager>`);
    }

    /** Channel page header (ChannelPageRedirect). */
    setChannelPage(channelName: string): void {
        this.append(`
            <ytd-page-manager>
                <ytd-browse page-subtype="channels" role="main">
                    <yt-page-header-renderer>
                        <yt-dynamic-text-view-model><h1><span>${escapeHtml(channelName)}</span></h1></yt-dynamic-text-view-model>
                    </yt-page-header-renderer>
                </ytd-browse>
            </ytd-page-manager>`);
    }

    private append(html: string): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const element = template.content.firstElementChild as HTMLElement;
        this.root.appendChild(element);

        return element;
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
