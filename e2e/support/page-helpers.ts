import type { Locator, Page } from '@playwright/test';
import { expect } from './fixtures';

/** A video rendered by the YouTube mock, found by its title. */
export function video(page: Page, title: string): Locator {
    return page.locator(`[data-e2e="video"][data-title="${title.replace(/"/g, '\\"')}"]`);
}

/** The extension's "hide channel" button (the class name typo is the real selector). */
export function blackListButtons(page: Page): Locator {
    return page.locator('.blb-conainer');
}

/**
 * Waits until the content script has processed the page at least once.
 * The heartbeat injects the "hide channel" buttons and filters the page in the same tick, so once a
 * button exists, filtering has been applied as well. Requires the channels restriction to be on.
 */
export async function waitForContentScript(page: Page): Promise<void> {
    await expect(blackListButtons(page).first()).toBeAttached();
}
