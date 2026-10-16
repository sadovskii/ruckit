import { HideListItemGroupType, HideListItemType, HideListModel } from "./hide-list.models";

export function HideListModelConfiguration(map: Map<HideListItemType, boolean>): HideListModel {
    return {
        groups: [
            {
                nameKey: "hidelist_group_general",
                type: HideListItemGroupType.General,
                items: [
                    {
                        nameKey: "hidelist_item_hide_shorts",
                        type: HideListItemType.GeneralHideShorts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.GeneralHideShorts],
                        value: map?.get(HideListItemType.GeneralHideShorts) ?? false
                    }
                ]
            },
            {
                nameKey: "hidelist_group_home_feed",
                type: HideListItemGroupType.HomeFeed,
                items: [
                    {
                        nameKey: "hidelist_item_suggested_videos_grid",
                        type: HideListItemType.HomeFeedSuggestedVideosGrid,
                        cssUrl: HidelistCssConfiguration[HideListItemType.HomeFeedSuggestedVideosGrid],
                        value: map?.get(HideListItemType.HomeFeedSuggestedVideosGrid) ?? false
                    }
                ]
            },
            {
                nameKey: "hidelist_group_header",
                type: HideListItemGroupType.Header,
                items: [
                    {
                        nameKey: "hidelist_item_notifications_bell",
                        type: HideListItemType.HeaderNotificationsBell,
                        cssUrl: HidelistCssConfiguration[HideListItemType.HeaderNotificationsBell],
                        value: map?.get(HideListItemType.HeaderNotificationsBell) ?? false
                    }           
                ]
            },
            {
                nameKey: "hidelist_group_watch_page",
                type: HideListItemGroupType.WatchPage,
                items: [
                    {
                        nameKey: "hidelist_item_pre_end_suggestions",
                        type: HideListItemType.WatchPagePreendSuggestions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPagePreendSuggestions],
                        value: map?.get(HideListItemType.WatchPagePreendSuggestions) ?? false
                    },
                    {
                        nameKey: "hidelist_item_end_screen_suggestions",
                        type: HideListItemType.WatchPageEndScreenSuggestions,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageEndScreenSuggestions],
                        value: map?.get(HideListItemType.WatchPageEndScreenSuggestions) ?? false
                    },
                    {
                        nameKey: "hidelist_item_up_next_sidebar",
                        type: HideListItemType.WatchPageUpNextSidebar,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageUpNextSidebar],
                        value: map?.get(HideListItemType.WatchPageUpNextSidebar) ?? false
                    },
                    {
                        nameKey: "hidelist_item_comments_section",
                        type: HideListItemType.WatchPageCommentsSection,
                        cssUrl: HidelistCssConfiguration[HideListItemType.WatchPageCommentsSection],
                        value: map?.get(HideListItemType.WatchPageCommentsSection) ?? false
                    },
                ]
            },
            {
                nameKey: "hidelist_group_search_results",
                type: HideListItemGroupType.SearchResults,
                items: [
                    {
                        nameKey: "hidelist_item_topic_chips",
                        type: HideListItemType.SearchResultsTopicChips,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsTopicChips],
                        value: map?.get(HideListItemType.SearchResultsTopicChips) ?? false
                    },
                    {
                        //Latest posts from
                        nameKey: "hidelist_item_latest_posts",
                        type: HideListItemType.SearchResultsLatestPosts,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsLatestPosts],
                        value: map?.get(HideListItemType.SearchResultsLatestPosts) ?? false
                    },
                    {
                        nameKey: "hidelist_item_suggestions_sections",
                        type: HideListItemType.SearchResultsSuggestionsSections,
                        cssUrl: HidelistCssConfiguration[HideListItemType.SearchResultsSuggestionsSections],
                        value: map?.get(HideListItemType.SearchResultsSuggestionsSections) ?? false
                    }

                ]
            },
            {
                nameKey: "hidelist_group_video_thumbnails",
                type: HideListItemGroupType.VideoThumbnails,
                items: [
                    {
                        nameKey: "hidelist_item_thumbnail_blackout",
                        type: HideListItemType.VideoThumbnailsThumbnailBlackout,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoThumbnailsThumbnailBlackout],
                        value: map?.get(HideListItemType.VideoThumbnailsThumbnailBlackout) ?? false
                    },
                    {
                        nameKey: "hidelist_item_disable_hover_playback",
                        type: HideListItemType.VideoThumbnailsDisableHoverPlayback,
                        cssUrl: HidelistCssConfiguration[HideListItemType.VideoThumbnailsDisableHoverPlayback],
                        value: map?.get(HideListItemType.VideoThumbnailsDisableHoverPlayback) ?? false
                    },
                    {
                        nameKey: "hidelist_item_disable_hover_image",
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