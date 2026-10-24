import targetsJson from '../targets.json';

export type TargetName = keyof typeof targetsJson;

export interface Target {
    /** "chrome" / "msedge" = installed Google Chrome / Microsoft Edge, "chromium" = Playwright's Chromium. */
    channel: string;
    browser?: 'chrome' | 'edge';

    /**
     * Tests attach to a browser window opened with "npm run e2e:open:<target>" (where you signed in once),
     * through its DevTools port. Without a port, a temporary browser is started (mocked project).
     */
    port?: number;
    /** Profile of that window, relative to the repository root. */
    profileDir?: string;

    /** Local build: unpacked folder (relative to the repository root), loaded by the tests. */
    extensionDir?: string;
    /** npm script that produces extensionDir. */
    buildScript?: string;

    /** Store version: ID of the extension installed from the store in the window. */
    extensionId?: string;
    storeUrl?: string;
}

export const TARGETS: Record<TargetName, Target> = targetsJson as Record<TargetName, Target>;
