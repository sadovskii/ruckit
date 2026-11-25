import { YouTubeTheme } from "./youtube-theme";

// YouTube's own dark palette
const DARK_BACKGROUND = '#0f0f0f';
const DARK_TEXT = '#f1f1f1';

/**
 * YouTube's 404 page (the base of the blocked page) is always light: its colours are hard-coded inside the iframe.
 * For the dark theme we repaint it with YouTube's dark colours. The light theme is already what the page looks like.
 *
 * @param outerDoc the page itself
 * @param innerDoc the document of the iframe that holds the 404 content (and our message)
 */
export function applyBlockedPageTheme(outerDoc: Document, innerDoc: Document, theme: YouTubeTheme | null): void {
    if (theme !== 'dark') {
        return;
    }

    outerDoc.documentElement.style.backgroundColor = DARK_BACKGROUND;
    outerDoc.documentElement.style.colorScheme = 'dark';

    const style = innerDoc.createElement('style');
    style.textContent = `
        body { background: ${DARK_BACKGROUND} !important; }
        .ruckit-constraint-main .message { color: ${DARK_TEXT}; }
    `;
    innerDoc.head.appendChild(style);
}
