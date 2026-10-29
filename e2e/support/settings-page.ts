import type { Locator, Page } from '@playwright/test';
import { expect, test, type ExtensionHandle } from './fixtures';

/*
 * Page helpers for the extension's settings page (index.html in a tab). The UI may be English or Russian
 * (it follows the browser language), so elements are found by component tags, classes and order, not by text.
 */

export type Section = 'home' | 'about' | 'blacklist' | 'hidelist' | 'password' | 'settings';
export type SidebarLink = Exclude<Section, 'home'> | 'support' | 'feedback';

/** Order of the items in the sidebar (src/app/settings/sidebar/sidebar.component.html). */
const SIDEBAR_INDEX: Record<SidebarLink, number> = { about: 0, blacklist: 1, hidelist: 2, password: 3, settings: 4, support: 5, feedback: 6 };

const SECTION_COMPONENT: Record<Section, string> = {
    home: 'app-start-page',
    about: 'app-about-extension',
    blacklist: 'app-black-list',
    hidelist: 'app-hide-list',
    password: 'app-password',
    settings: 'app-inner-settings',
};

export const settingsUrl = (origin: string, action?: string) => `${origin}/index.html${action ? `?action=${action}` : ''}`;

export function sidebarItem(page: Page, link: SidebarLink): Locator {
    return page.locator('app-sidebar app-sidebar-item').nth(SIDEBAR_INDEX[link]);
}

export function section(page: Page, name: Section): Locator {
    return page.locator(SECTION_COMPONENT[name]);
}

/** Opens the settings page in `page` (optionally with ?action=) and waits until the Angular app is rendered. */
export async function gotoSettings(page: Page, origin: string, action?: string): Promise<void> {
    await page.goto(settingsUrl(origin, action));
    await expect(page.locator('app-settings')).toBeVisible();
}

export async function openSection(page: Page, name: Exclude<Section, 'home'>): Promise<void> {
    await sidebarItem(page, name).click();
    await expect(section(page, name)).toBeVisible();
}

// ---------- toggles ----------

/** A ruckit-toggle: `switch` is what the user clicks, `input` holds the checked state. */
export function toggle(scope: Locator) {
    const root = scope.locator('ruckit-toggle').first();

    return {
        root,
        switch: root.locator('nb-toggle'),
        input: root.locator('input[type="checkbox"]'),
        lockIcon: root.locator('nb-icon[icon="closed-lock-16"]'),
    };
}

// ---------- black list ----------

export type ListName = 'channels' | 'keywords';
/** Cards on the black-list page: Channels, then Keywords and phrases (one list since the merge). */
const LIST_INDEX: Record<ListName, number> = { channels: 0, keywords: 1 };

let storeVersionHasMergedList: boolean | undefined;

/**
 * Skips the test on the store versions (prod-*) until a version with phrases merged into keywords is published:
 * the older store versions still have a separate Phrases list. Local builds and mocked always run the test.
 */
export async function skipUntilMergedListIsPublished(page: Page, extension: ExtensionHandle): Promise<void> {
    if (!extension.target.startsWith('prod')) return;

    if (storeVersionHasMergedList === undefined) {
        await gotoSettings(page, extension.origin, 'blacklist');
        await expect(page.locator('app-black-list-simple-item').first()).toBeVisible();
        storeVersionHasMergedList = await page.locator('app-black-list-simple-item').count() === 2;
    }

    test.skip(!storeVersionHasMergedList, `store version ${extension.version} still has the separate Phrases list`);
}

export function blackListCard(page: Page, list: ListName) {
    const root = page.locator('app-black-list-simple-item').nth(LIST_INDEX[list]);

    return {
        root,
        toggle: toggle(root),
        input: root.locator('input.add-new-item__input'),
        addButton: root.locator('button.add-new-item__button'),
        manageButton: root.locator('button.open-advanced-settings'),
        count: root.locator('.count'),
    };
}

export async function addViaCard(page: Page, list: ListName, value: string): Promise<void> {
    const card = blackListCard(page, list);
    await card.input.fill(value);
    await card.addButton.click();
}

export function manageDialog(page: Page) {
    const root = page.locator('app-black-list-manage-restrictions');
    const items = root.locator('.option-list-item');

    return {
        root,
        newInput: root.locator('.new-resctiction input'),
        newButton: root.locator('.new-resctiction button'),
        search: root.locator('ruckit-option-list input.search'),
        items,
        itemNames: root.locator('.option-list-item__name'),
        item: (name: string) => items.filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }),
        /** The × of an item only shows while the item is hovered, like for a user. */
        remove: async (name: string) => {
            const item = items.filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) });
            await item.hover();
            await item.locator('nb-icon').click();
        },
        notFound: root.locator('.option-list-unfound'),
        notFoundAddButton: root.locator('.option-list-unfound__add-item'),
        empty: root.locator('.option-list-empty'),
        count: root.locator('.hidden-count'),
        closeButton: root.locator('ruckit-dialog .icon-container'),
    };
}

export async function openManageDialog(page: Page, list: ListName) {
    await blackListCard(page, list).manageButton.click();
    const dialog = manageDialog(page);
    await expect(dialog.root).toBeVisible();

    return dialog;
}

// ---------- hide list ----------

/** Option order on the hide-list page and the HideListItemType value stored for each (hide-list.configuration.ts). */
export const HIDE_LIST_OPTIONS = [
    { type: 18, name: 'Hide Shorts' },
    { type: 1, name: 'Suggested Videos Grid' },
    { type: 3, name: 'Notifications Bell' },
    { type: 7, name: 'Pre-end Suggestions' },
    { type: 6, name: 'End Screen Suggestions' },
    { type: 4, name: 'Up-Next Sidebar' },
    { type: 5, name: 'Comments Section' },
    { type: 13, name: 'Topic Chips' },
    { type: 14, name: 'Latest Posts' },
    { type: 15, name: 'Suggestions Sections' },
    { type: 8, name: 'Thumbnail Blackout' },
    { type: 9, name: 'Disable Hover Playback' },
    { type: 10, name: 'Disable Hover Image' },
] as const;

export const HIDE_LIST_GROUPS = 6;

export function hideListOption(page: Page, type: number) {
    const index = HIDE_LIST_OPTIONS.findIndex(option => option.type === type);
    if (index < 0) throw new Error(`unknown hide-list option ${type}`);

    return toggle(page.locator('app-hide-list-block-item').nth(index));
}

// ---------- password ----------

export function passwordSection(page: Page) {
    const root = page.locator('app-password');
    const change = root.locator('app-change-password');

    return {
        root,
        requestToggle: toggle(root.locator('app-settings-item').nth(0)),
        periodSelect: root.locator('nb-select'),
        changeInputs: change.locator('input.password-input'),
        changeButton: change.locator('form > button'),
    };
}

/** "Setting a password" dialog. */
export function setPasswordDialog(page: Page) {
    const root = page.locator('app-set-new-password');

    return { root, inputs: root.locator('input.password-input'), submit: root.locator('form > button'), closeButton: root.locator('ruckit-dialog .icon-container') };
}

/** "Enter your password" dialog. */
export function enterPasswordDialog(page: Page) {
    const root = page.locator('app-enter-password');

    return { root, input: root.locator('input.password-input'), submit: root.locator('form > button'), closeButton: root.locator('ruckit-dialog .icon-container') };
}

export async function enterPassword(page: Page, password: string): Promise<void> {
    const dialog = enterPasswordDialog(page);
    await expect(dialog.root).toBeVisible();
    await dialog.input.fill(password);
    await dialog.submit.click();
}

/** Options of an opened nb-select (rendered in an overlay at the end of the page). */
export function selectOptions(page: Page): Locator {
    return page.locator('nb-option-list nb-option');
}

// ---------- snack bar ----------

export function snackBar(page: Page) {
    const root = page.locator('ruckit-snack-bar .snack-bar');

    return { root, text: root.locator('.info-text'), actionButton: root.locator('.info__button') };
}

/** Input marked invalid (Nebular "danger" status). */
export async function expectInvalid(input: Locator): Promise<void> {
    await expect(input).toHaveClass(/status-danger/);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
