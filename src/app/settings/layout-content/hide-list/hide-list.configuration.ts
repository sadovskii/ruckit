import { HideListItemGroupType, HideListItemType, HideListModel } from "./hide-list.models";

export function HideListModelConfiguration(map: Map<HideListItemType, boolean>): HideListModel {
    return {
        groups: [
            {
                name: "General",
                type: HideListItemGroupType.General,
                items: [
                    {
                        name: "Hide Shorts",
                        type: HideListItemType.GeneralHideShorts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.GeneralHideShorts],
                        value: map?.get(HideListItemType.GeneralHideShorts) ?? false
                    }
                ]
            },
            {
                name: "Home Feed",
                type: HideListItemGroupType.HomeFeed,
                items: [
                    {
                        name: "Suggested Videos Grid",
                        type: HideListItemType.HomeFeedSuggestedVideosGrid,
                        cssUrl: HidelistCssConfiguration[HideListItemType.HomeFeedSuggestedVideosGrid],
                        value: map?.get(HideListItemType.HomeFeedSuggestedVideosGrid) ?? false
                    }
                ]
            },
            {
                name: "Header",
                type: HideListItemGroupType.Header,
                items: [
                    {
                        name: "Notifications Bell",
                        type: HideListItemType.HeaderNotificationsBell,
                        cssUrl: HidelistCssConfiguration[HideListItemType.HeaderNotificationsBell],
                        value: map?.get(HideListItemType.HeaderNotificationsBell) ?? false
                    }           
                ]
            },
            {
                name: "Watch page",
                type: HideListItemGroupType.WatchPage,
                items: [
                    {
                        name: "Pre-end Suggestions",
                        type: HideListItemType.WatchPagePreendSuggestions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPagePreendSuggestions],
                        value: map?.get(HideListItemType.WatchPagePreendSuggestions) ?? false
                    },
                    {
                        name: "End Screen Suggestions",
                        type: HideListItemType.WatchPageEndScreenSuggestions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageEndScreenSuggestions],
                        value: map?.get(HideListItemType.WatchPageEndScreenSuggestions) ?? false
                    },
                    {
                        name: "Up-Next Sidebar",
                        type: HideListItemType.WatchPageUpNextSidebar,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageUpNextSidebar],
                        value: map?.get(HideListItemType.WatchPageUpNextSidebar) ?? false
                    },
                    {
                        name: "Comments Section",
                        type: HideListItemType.WatchPageCommentsSection,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageCommentsSection],
                        value: map?.get(HideListItemType.WatchPageCommentsSection) ?? false
                    },
                ]
            },
            {
                name: "Search results",
                type: HideListItemGroupType.SearchResults,
                items: [
                    {
                        name: "Topic Chips",
                        type: HideListItemType.SearchResultsTopicChips,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsTopicChips],
                        value: map?.get(HideListItemType.SearchResultsTopicChips) ?? false
                    },
                    {
                        //Latest posts from
                        name: "Latest Posts",
                        type: HideListItemType.SearchResultsLatestPosts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsLatestPosts],
                        value: map?.get(HideListItemType.SearchResultsLatestPosts) ?? false
                    },
                    {
                        name: "Suggestions Sections",
                        type: HideListItemType.SearchResultsSuggestionsSections,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsSuggestionsSections],
                        value: map?.get(HideListItemType.SearchResultsSuggestionsSections) ?? false
                    }

                ]
            },
            {
                name: "Video Thumbnails",
                type: HideListItemGroupType.VideoThumbnails,
                items: [
                    {
                        name: "Thumbnail Blackout",
                        type: HideListItemType.VideoThumbnailsThumbnailBlackout,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoThumbnailsThumbnailBlackout],
                        value: map?.get(HideListItemType.VideoThumbnailsThumbnailBlackout) ?? false
                    },
                    {
                        name: "Disable Hover Playback",
                        type: HideListItemType.VideoThumbnailsDisableHoverPlayback,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoThumbnailsDisableHoverPlayback],
                        value: map?.get(HideListItemType.VideoThumbnailsDisableHoverPlayback) ?? false
                    },
                    {
                        name: "Disable Hover Image",
                        type: HideListItemType.VideoThumbnailsDisableHoverImage,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoThumbnailsDisableHoverImage],
                        value: map?.get(HideListItemType.VideoThumbnailsDisableHoverImage) ?? false
                    },
                ]
            }
        ]
    }
}

export class HidelistCssConfiguration {
    static [HideListItemType.HomeFeedSuggestedVideosGrid] = "styles/hide-list/home-feed-suggested-videos-grid.css";
    static [HideListItemType.SidebarShortsTab] = null //"styles/hide-list/sidebar-shorts-tab.css";
    static [HideListItemType.HeaderNotificationsBell] = "styles/hide-list/header-notifications-bell.css";
    static [HideListItemType.WatchPageUpNextSidebar] = "styles/hide-list/watch-page-up-next-sidebar.css";
    static [HideListItemType.WatchPageCommentsSection] = "styles/hide-list/watch-page-comments-section.css";
    static [HideListItemType.WatchPageEndScreenSuggestions] = "styles/hide-list/watch-page-end-screen-suggestions.css";
    static [HideListItemType.WatchPagePreendSuggestions] = "styles/hide-list/watch-page-pre-end-suggestions.css";
    static [HideListItemType.VideoThumbnailsThumbnailBlackout] = "styles/hide-list/video-thumbnails-thumbnail-blackout.css";
    static [HideListItemType.VideoThumbnailsDisableHoverPlayback] = "styles/hide-list/video-thumbnails-disable-hover-playback.css";
    static [HideListItemType.VideoThumbnailsDisableHoverImage] = "styles/hide-list/video-thumbnails-disable-hover-image.css";
    static [HideListItemType.SearchResultsShortsShelf] = null //"styles/hide-list/search-results-shorts-shelf.css";
    static [HideListItemType.SearchResultsSingleShorts] = null //"styles/hide-list/search-results-single-shorts.css";
    static [HideListItemType.SearchResultsTopicChips] = "styles/hide-list/search-results-topic-chips.css";
    static [HideListItemType.SearchResultsLatestPosts] = "styles/hide-list/search-results-latest-posts.css";
    static [HideListItemType.SearchResultsSuggestionsSections] = "styles/hide-list/search-results-suggestions-sections.css";
    static [HideListItemType.ChannelPageShortsTab] = null //"styles/hide-list/channel-page-shorts-tab.css";
    static [HideListItemType.ShortsPageShortsSection] = null //"styles/hide-list/shorts-page-shorts-section.css";
    static [HideListItemType.GeneralHideShorts] = "styles/hide-list/general-hide-shorts.css"
}