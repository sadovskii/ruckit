import { test, expect } from '../../support/fixtures';
import { hideList } from '../../support/storage-data';
import { searchResultsPage, youtubeUrl } from '../../support/youtube-mock';

/*
 * Hide-list CSS is inserted by the background script when a YouTube page is committed,
 * so the storage must be prepared before navigating.
 * The notifications bell is used as a control: once it is hidden, the CSS insertion has happened.
 */
test.describe('hide list', () => {
    const pageWithShorts = () => searchResultsPage([{ title: 'Some video' }], { shortsShelf: true, notificationsBell: true });

    test('hides shorts when "hide shorts" is on', async ({ page, storage, youtube }) => {
        await storage.reset(hideList({ generalHideShorts: true, headerNotificationsBell: true }));

        await page.goto(youtube.serve(youtubeUrl.search('shorts'), pageWithShorts()));

        await expect(page.locator('[data-e2e="notifications-bell"]')).toBeHidden();
        await expect(page.locator('[data-e2e="shorts-shelf"]')).toBeHidden();
    });

    test('keeps shorts when "hide shorts" is off', async ({ page, storage, youtube }) => {
        await storage.reset(hideList({ generalHideShorts: false, headerNotificationsBell: true }));

        await page.goto(youtube.serve(youtubeUrl.search('shorts'), pageWithShorts()));

        await expect(page.locator('[data-e2e="notifications-bell"]')).toBeHidden();
        await expect(page.locator('[data-e2e="shorts-shelf"]')).toBeVisible();
    });
});
