export interface HideListItemModel {
    name: string;
    type: HideListItemType;
    cssUrl: string;
    value?: boolean;
}

export interface HideListModel {
    groups: HideListGroupModel[];
}

export interface HideListGroupModel {
    name: string;
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
