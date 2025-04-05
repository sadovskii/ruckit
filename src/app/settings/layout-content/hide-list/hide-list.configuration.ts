import { HideListItemGroupType, HideListItemType, HideListModel } from "./hide-list.models";

export function HideListModelConfiguration(map: Map<HideListItemType, boolean>): HideListModel {
    return {
        groups: [
            {
                name: "Header",
                type: HideListItemGroupType.Header,
                items: [
                    {
                        name: "Notification",
                        type: HideListItemType.HeaderNotification,
                        cssUrl: HidelistCssConfiguration[HideListItemType.HeaderNotification],
                        value: map?.get(HideListItemType.HeaderNotification) ?? false
                    }           
                ]
            },
            {
                name: "Main page",
                type: HideListItemGroupType.MainMenu,
                items: [
                    {
                        name: "Suggestions",
                        type: HideListItemType.MainMenuSuggesions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.MainMenuSuggesions],
                        value: map?.get(HideListItemType.MainMenuSuggesions) ?? false
                    }
                ]
            },
            {
                name: "Left panel",
                type: HideListItemGroupType.LeftPanel,
                items: [
                    {
                        name: "Shorts",
                        type: HideListItemType.LeftPanelShorts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.LeftPanelShorts],
                        value: map?.get(HideListItemType.LeftPanelShorts) ?? false
                    }
                ]
            },
            {
                name: "Thumbnails",
                type: HideListItemGroupType.Thumbnails,
                items: [
                    {
                        name: "Black in static",
                        type: HideListItemType.ThumbnailsBlack,
                        cssUrl: HidelistCssConfiguration[HideListItemType.ThumbnailsBlack],
                        value: map?.get(HideListItemType.ThumbnailsBlack) ?? false
                    },
                    {
                        name: "Gray (Black and white) when focusing",
                        type: HideListItemType.ThumbnailsGrayFocused,
                        cssUrl: HidelistCssConfiguration[HideListItemType.ThumbnailsGrayFocused],
                        value: map?.get(HideListItemType.ThumbnailsGrayFocused) ?? false
                    },
                    {
                        name: "Stop playback when focusing",
                        type: HideListItemType.ThumbnailsHideVidoeFocused,
                        cssUrl: HidelistCssConfiguration[HideListItemType.ThumbnailsHideVidoeFocused],
                        value: map?.get(HideListItemType.ThumbnailsHideVidoeFocused) ?? false
                    },
                ]
            },
            {
                name: "Search results",
                type: HideListItemGroupType.SearchResults,
                items: [
                    {
                        name: "Chip bar below search",
                        type: HideListItemType.SearchResultsChipBarBelowSearch,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsChipBarBelowSearch],
                        value: map?.get(HideListItemType.SearchResultsChipBarBelowSearch) ?? false
                    },
                    {
                        name: "Shorts section",
                        type: HideListItemType.SearchResultsShortSection,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsShortSection],
                        value: map?.get(HideListItemType.SearchResultsShortSection) ?? false
                    },
                    {
                        name: "Lonely short",
                        type: HideListItemType.SearchResultsLonelyShort,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsLonelyShort],
                        value: map?.get(HideListItemType.SearchResultsLonelyShort) ?? false
                    },
                    {
                        //Latest posts from
                        name: "\"Latest posts\" section",
                        type: HideListItemType.SearchResultsLatestPosts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsLatestPosts],
                        value: map?.get(HideListItemType.SearchResultsLatestPosts) ?? false
                    },
                    {
                        name: "Suggestions sections",
                        type: HideListItemType.SearchResultsSuggestionsSections,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsSuggestionsSections],
                        value: map?.get(HideListItemType.SearchResultsSuggestionsSections) ?? false
                    }

                ]
            },
            {
                name: "Video page",
                type: HideListItemGroupType.VideoPage,
                items: [
                    {
                        name: "Right panel suggestions",
                        type: HideListItemType.VidoePageRightPanelSuggestions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VidoePageRightPanelSuggestions],
                        value: map?.get(HideListItemType.VidoePageRightPanelSuggestions) ?? false
                    },
                    {
                        name: "Comments",
                        type: HideListItemType.VidoePageComments,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VidoePageComments],
                        value: map?.get(HideListItemType.VidoePageComments) ?? false
                    },
                    {
                        name: "Suggestions after video",
                        type: HideListItemType.VideoPageSuggestionsAfterVideo,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoPageSuggestionsAfterVideo],
                        value: map?.get(HideListItemType.VideoPageSuggestionsAfterVideo) ?? false
                    },
                    {
                        name: "The last seconds suggestions",
                        type: HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo],
                        value: map?.get(HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo) ?? false
                    }
                ]
            },
            {
                name: "Channel page",
                type: HideListItemGroupType.ChannelPage,
                items: [
                    {
                        name: "Shorts",
                        type: HideListItemType.ChannelPageShorts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.ChannelPageShorts],
                        value: map?.get(HideListItemType.ChannelPageShorts) ?? false
                    }
                ]
            },
            {
                name: "Shorts page",
                type: HideListItemGroupType.ShortsPage,
                items: [
                    {
                        name: "Shorts section",
                        type: HideListItemType.ShortsPageShortsSection,
                        cssUrl: HidelistCssConfiguration[HideListItemType.ShortsPageShortsSection],
                        value: map?.get(HideListItemType.ShortsPageShortsSection) ?? false
                    }
                ]
            }
        ]
    }
}

export class HidelistCssConfiguration {
    static [HideListItemType.MainMenuSuggesions] = "styles/hide-list/main-menu-suggestions.css";
    static [HideListItemType.LeftPanelShorts] = "styles/hide-list/left-panel-shorts.css";
    static [HideListItemType.HeaderNotification] = "styles/hide-list/header-notification.css";
    static [HideListItemType.VidoePageRightPanelSuggestions] = "styles/hide-list/video-page-right-panel-suggestions.css";
    static [HideListItemType.VidoePageComments] = "styles/hide-list/video-page-comments.css";
    static [HideListItemType.VideoPageSuggestionsAfterVideo] = "styles/hide-list/video-page-suggestions-after-video.css";
    static [HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo] = "styles/hide-list/video-page-suggestions-at-the-last-seconds-of-the-video.css";
    static [HideListItemType.ThumbnailsBlack] = "styles/hide-list/thumbnails-black.css";
    static [HideListItemType.ThumbnailsGrayFocused] = "styles/hide-list/thumbnails-gray-focused.css";
    static [HideListItemType.ThumbnailsHideVidoeFocused] = "styles/hide-list/thumbnails-hide-vidoe-focused.css";
    static [HideListItemType.SearchResultsShortSection] = "styles/hide-list/search-results-short-section.css";
    static [HideListItemType.SearchResultsLonelyShort] = "styles/hide-list/search-results-lonely-short.css";
    static [HideListItemType.SearchResultsChipBarBelowSearch] = "styles/hide-list/search-results-chip-bar-below-search.css";
    static [HideListItemType.SearchResultsLatestPosts] = "styles/hide-list/search-results-latest-posts.css";
    static [HideListItemType.SearchResultsSuggestionsSections] = "styles/hide-list/search-results-suggestions-sections.css";
    static [HideListItemType.ChannelPageShorts] = "styles/hide-list/channel-page-shorts.css";
    static [HideListItemType.ShortsPageShortsSection] = "styles/hide-list/shorts-page-shorts-section.css";
}