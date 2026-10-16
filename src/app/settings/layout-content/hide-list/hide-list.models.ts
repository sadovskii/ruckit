export interface HideListItemModel {
    /** i18n message key from _locales/<locale>/messages.json */
    nameKey: string;
    type: HideListItemType;
    cssUrl: string;
    value?: boolean;
}

export interface HideListModel {
    groups: HideListGroupModel[];
}

export interface HideListGroupModel {
    /** i18n message key from _locales/<locale>/messages.json */
    nameKey: string;
    type: HideListItemGroupType;
    items: HideListItemModel[];
}


export enum HideListItemType {
    HomeFeedSuggestedVideosGrid = 1,
    SidebarShortsTab, // obsolete
    HeaderNotificationsBell,
    WatchPageUpNextSidebar,
    WatchPageCommentsSection,
    WatchPageEndScreenSuggestions,
    WatchPagePreendSuggestions,
    VideoThumbnailsThumbnailBlackout,
    VideoThumbnailsDisableHoverPlayback,
    VideoThumbnailsDisableHoverImage,
    SearchResultsShortsShelf, // obsolete
    SearchResultsSingleShorts, // obsolete
    SearchResultsTopicChips,
    SearchResultsLatestPosts,
    SearchResultsSuggestionsSections,
    ChannelPageShortsTab, // obsolete
    ShortsPageShortsSection,  // obsolete
    GeneralHideShorts
}

export enum HideListItemGroupType {
    Header = 1,
    HomeFeed,
    WatchPage,
    Sidebar, // obsolete
    SearchResults,
    VideoThumbnails,
    ChannelPage,
    ShortsPage,
    General
}
