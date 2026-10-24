/**
 * Storage keys exactly as persisted by the extension (src/app/shared/constants.ts).
 * They are user data, so tests use the literal values on purpose: renaming a key in the
 * extension must break the tests instead of silently losing users' settings.
 */
export const KEYS = {
    channels: 'blch',
    channelsOn: 'blchito',
    keywords: 'blk',
    keywordsOn: 'blkito',
    phrases: 'blph',
    phrasesOn: 'blphito',
    hideList: 'hide-list',
} as const;

/** Values of HideListItemType (persisted numbers, see hide-list.models.ts). */
export const HIDE_LIST_ITEM = {
    homeFeedSuggestedVideosGrid: 1,
    headerNotificationsBell: 3,
    watchPageUpNextSidebar: 4,
    watchPageCommentsSection: 5,
    searchResultsTopicChips: 13,
    generalHideShorts: 18,
} as const;

export type StoredData = Record<string, unknown>;

export const keywordsOn = (keywords: string[]): StoredData => ({ [KEYS.keywords]: keywords, [KEYS.keywordsOn]: true });
export const phrasesOn = (phrases: string[]): StoredData => ({ [KEYS.phrases]: phrases, [KEYS.phrasesOn]: true });
export const channelsOn = (channels: string[] = []): StoredData => ({ [KEYS.channels]: channels, [KEYS.channelsOn]: true });

/** hide-list is stored as a serialized Map: [[HideListItemType, enabled], ...] */
export const hideList = (items: Partial<Record<keyof typeof HIDE_LIST_ITEM, boolean>>): StoredData => ({
    [KEYS.hideList]: Object.entries(items).map(([name, enabled]) => [HIDE_LIST_ITEM[name as keyof typeof HIDE_LIST_ITEM], enabled]),
});
