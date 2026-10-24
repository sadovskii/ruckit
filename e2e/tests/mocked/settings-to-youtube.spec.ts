import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures';
import { channelsOn, hideList, keywordsOn } from '../../support/storage-data';
import { searchResultsPage, youtubeUrl } from '../../support/youtube-mock';
import { video, waitForContentScript } from '../../support/page-helpers';
import { blackListCard, gotoSettings, hideListOption, openManageDialog, snackBar } from '../../support/settings-page';

/*
 * How changes on the settings page reach an open YouTube tab (offline, fake YouTube pages):
 * weakening the black list reloads YouTube tabs; hide-list options are applied to open tabs without a reload.
 * IDs refer to e2e/docs/youtube-page.md and e2e/docs/settings-page.md.
 */

/** Marks the page; the mark is gone after a reload. */
const markPage = (page: Page) => page.evaluate(() => { (window as any).__e2eMark = true; });
const isMarked = (page: Page) => page.evaluate(() => (window as any).__e2eMark === true).catch(() => false);

const SHORTS_SHELF = '[data-e2e="shorts-shelf"]';

test.describe('settings → youtube page', () => {
    test('YT-KW-09 removing a keyword reloads YouTube tabs and the video comes back', async ({ page, storage, youtube, extension }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });
        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([{ title: 'Funny cats' }, { title: 'Dogs' }])));
        await expect(video(page, 'Funny cats')).toHaveCount(0);
        await markPage(page);

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'blacklist');
        const dialog = await openManageDialog(settings, 'keywords');
        await dialog.remove('cats');

        await expect.poll(() => isMarked(page)).toBe(false);
        await expect(video(page, 'Funny cats')).toBeVisible();
    });

    test('ST-BL-03 / YT-KW-09 turning keywords off reloads YouTube tabs and the video comes back', async ({ page, storage, youtube, extension }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn(['cats']) });
        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([{ title: 'Funny cats' }, { title: 'Dogs' }])));
        await expect(video(page, 'Funny cats')).toHaveCount(0);
        await markPage(page);

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'blacklist');
        await blackListCard(settings, 'keywords').toggle.switch.click();

        await expect.poll(() => isMarked(page)).toBe(false);
        await expect(video(page, 'Funny cats')).toBeVisible();
    });

    test('ST-BL-02 adding a keyword hides matching videos without a reload', async ({ page, storage, youtube, extension }) => {
        await storage.reset({ ...channelsOn(), ...keywordsOn([]) });
        await page.goto(youtube.serve(youtubeUrl.search('pets'), searchResultsPage([{ title: 'Funny cats' }, { title: 'Dogs' }])));
        await waitForContentScript(page);
        await markPage(page);

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'blacklist');
        await blackListCard(settings, 'keywords').input.fill('cats');
        await blackListCard(settings, 'keywords').addButton.click();

        await expect(video(page, 'Funny cats')).toHaveCount(0);
        expect(await isMarked(page)).toBe(true);
    });

    test('YT-HL-E02 / ST-HL-03 turning "Hide Shorts" off shows shorts in an open tab without a reload', async ({ page, storage, youtube, extension }) => {
        await storage.reset(hideList({ generalHideShorts: true }));
        await page.goto(youtube.serve(youtubeUrl.search('shorts'), searchResultsPage([{ title: 'Some video' }], { shortsShelf: true })));
        await expect(page.locator(SHORTS_SHELF)).toBeHidden();
        await markPage(page);

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'hidelist');
        await hideListOption(settings, 18).switch.click();

        await expect(page.locator(SHORTS_SHELF)).toBeVisible();
        expect(await isMarked(page)).toBe(true);
    });

    test('YT-HL-E01 / ST-HL-02 turning "Hide Shorts" on hides shorts in an open tab without a reload', async ({ page, storage, youtube, extension }) => {
        await storage.reset(hideList({ generalHideShorts: false }));
        await page.goto(youtube.serve(youtubeUrl.search('shorts'), searchResultsPage([{ title: 'Some video' }], { shortsShelf: true })));
        await expect(page.locator(SHORTS_SHELF)).toBeVisible();
        await markPage(page);

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'hidelist');
        await hideListOption(settings, 18).switch.click();

        await expect(page.locator(SHORTS_SHELF)).toBeHidden();
        expect(await isMarked(page)).toBe(true);
    });

    test('ST-PW-E07 a hide-list option blocked by the password lock changes nothing on YouTube', async ({ page, storage, youtube, extension }) => {
        await storage.reset({ ...hideList({ generalHideShorts: true }), password: 's3cret' });
        await page.goto(youtube.serve(youtubeUrl.search('shorts'), searchResultsPage([{ title: 'Some video' }], { shortsShelf: true })));
        await expect(page.locator(SHORTS_SHELF)).toBeHidden();

        const settings = await extension.context.newPage();
        await gotoSettings(settings, extension.origin, 'hidelist');
        await hideListOption(settings, 18).switch.click();
        await expect(snackBar(settings).root).toBeVisible();

        await page.waitForTimeout(1_000);
        await expect(page.locator(SHORTS_SHELF)).toBeHidden();
    });
});
