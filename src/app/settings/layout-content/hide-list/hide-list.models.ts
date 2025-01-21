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
    MainMenuSuggesions = 1,
    LeftPanelShorts,
    HeaderNotification,
    VidoePageRightPanelSuggestions,
    VidoePageComments,
    VideoPageSuggestionsAfterVideo,
    VidoePageSuggestionsAtTheLastSecondsOfTheVideo,
    ThumbnailsBlack,
    ThumbnailsGrayFocused,
    ThumbnailsHideVidoeFocused,
    SearchResultsShortSection,
    SearchResultsLonelyShort,
    SearchResultsChipBarBelowSearch,
    SearchResultsLatestPosts,
    SearchResultsSuggestionsSections,
    ChannelPageShorts,
    ChannelPageShortGrid,
    ShortsPageShortsSection
}

export enum HideListItemGroupType {
    Header = 1,
    MainMenu,
    VideoPage,
    LeftPanel,
    SearchResults,
    Thumbnails,
    ChannelPage,
    ShortsPage
}
