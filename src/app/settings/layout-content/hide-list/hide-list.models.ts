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
    SidebarShortsTab,
    HeaderNotificationsBell,
    WatchPageUpNextSidebar,
    WatchPageCommentsSection,
    WatchPageEndScreenSuggestions,
    WatchPagePreendSuggestions,
    VideoThumbnailsThumbnailBlackout,
    VideoThumbnailsDisableHoverPlayback,
    VideoThumbnailsDisableHoverImage,
    SearchResultsShortsShelf,
    SearchResultsSingleShorts,
    SearchResultsTopicChips,
    SearchResultsLatestPosts,
    SearchResultsSuggestionsSections,
    ChannelPageShortsTab,
    ShortsPageShortsSection
}

export enum HideListItemGroupType {
    Header = 1,
    HomeFeed,
    WatchPage,
    Sidebar,
    SearchResults,
    VideoThumbnails,
    ChannelPage,
    ShortsPage
}
