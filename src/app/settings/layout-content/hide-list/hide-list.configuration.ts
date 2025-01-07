import { HideListItemGroupType, HideListItemType, HideListModel } from "./hide-list.models";

export function HideListModelConfiguration(map: Map<HideListItemType, boolean>): HideListModel {
    return {
        groups: [
            {
                name: "Main page",
                type: HideListItemGroupType.MainMenu,
                items: [
                    {
                        name: "Suggestions",
                        type: HideListItemType.MainMenuSuggesions,
                        cssUrl: "styles/hide-list/main-menu-suggestions.css",
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
                        cssUrl: "styles/hide-list/left-panel-shorts.css",
                        value: map?.get(HideListItemType.LeftPanelShorts) ?? false
                    }
                ]
            },
            {
                name: "Header",
                type: HideListItemGroupType.Header,
                items: [
                    {
                        name: "Notification",
                        type: HideListItemType.HeaderNotification,
                        cssUrl: "styles/hide-list/header-notification.css",
                        value: map?.get(HideListItemType.HeaderNotification) ?? false
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
                        cssUrl: "styles/hide-list/video-page-right-panel-suggestions.css",
                        value: map?.get(HideListItemType.VidoePageRightPanelSuggestions) ?? false
                    },
                    {
                        name: "Comments",
                        type: HideListItemType.VidoePageComments,
                        cssUrl: "styles/hide-list/video-page-comments.css",
                        value: map?.get(HideListItemType.VidoePageComments) ?? false
                    },
                    {
                        name: "Suggestions after video",
                        type: HideListItemType.VideoPageSuggestionsAfterVideo,
                        cssUrl: "styles/hide-list/video-page-suggestions-after-video.css",
                        value: map?.get(HideListItemType.VideoPageSuggestionsAfterVideo) ?? false
                    },
                    {
                        name: "Suggestions at the last seconds of the video",
                        type: HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo,
                        cssUrl: "styles/hide-list/video-page-suggestions-at-the-last-seconds-of-the-video.css",
                        value: map?.get(HideListItemType.VidoePageSuggestionsAtTheLastSecondsOfTheVideo) ?? false
                    }
                ]
            },
            {
                name: "Thumbnails",
                type: HideListItemGroupType.Thumbnails,
                items: [
                    {
                        name: "Black thumbnail when you don't focus on it",
                        type: HideListItemType.ThumbnailsBlackUnfocused,
                        cssUrl: "styles/hide-list/thumbnails-black-unfocused.css",
                        value: map?.get(HideListItemType.ThumbnailsBlackUnfocused) ?? false
                    },
                    {
                        name: "Gray thumbnail when you focus on it",
                        type: HideListItemType.ThumbnailsGrayFocused,
                        cssUrl: "styles/hide-list/thumbnails-gray-focused.css",
                        value: map?.get(HideListItemType.ThumbnailsGrayFocused) ?? false
                    },
                    {
                        name: "Hide video in thumbnail when you focus on it",
                        type: HideListItemType.ThumbnailsHideVidoeFocused,
                        cssUrl: "styles/hide-list/thumbnails-hide-vidoe-focused.css",
                        value: map?.get(HideListItemType.ThumbnailsHideVidoeFocused) ?? false
                    },
                ]
            },
            {
                name: "Search results",
                type: HideListItemGroupType.SearchResults,
                items: [
                    {
                        name: "Shorts section",
                        type: HideListItemType.SearchResultsShortSection,
                        cssUrl: "styles/hide-list/search-results-short-section.css",
                        value: map?.get(HideListItemType.SearchResultsShortSection) ?? false
                    },
                    {
                        name: "Lonely short",
                        type: HideListItemType.SearchResultsLonelyShort,
                        cssUrl: "styles/hide-list/search-results-lonely-short.css",
                        value: map?.get(HideListItemType.SearchResultsLonelyShort) ?? false
                    },
                    {
                        name: "Chip bar below search",
                        type: HideListItemType.SearchResultsChipBarBelowSearch,
                        cssUrl: "styles/hide-list/search-results-chip-bar-below-search.css",
                        value: map?.get(HideListItemType.SearchResultsChipBarBelowSearch) ?? false
                    },
                    {
                        //Latest posts from
                        name: "\"Latest posts\" section",
                        type: HideListItemType.SearchResultsLatestPosts,
                        cssUrl: "styles/hide-list/search-results-latest-posts.css",
                        value: map?.get(HideListItemType.SearchResultsLatestPosts) ?? false
                    },
                    {
                        name: "Suggestions sections",
                        type: HideListItemType.SearchResultsSuggestionsSections,
                        cssUrl: "styles/hide-list/search-results-suggestions-sections.css",
                        value: map?.get(HideListItemType.SearchResultsSuggestionsSections) ?? false
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
                        cssUrl: "styles/hide-list/channel-page-shorts.css",
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
                        cssUrl: "styles/hide-list/shorts-page-shorts-section.css",
                        value: map?.get(HideListItemType.ShortsPageShortsSection) ?? false
                    }
                ]
            }
        ]
    }
}