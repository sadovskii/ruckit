/**
 * Enum of all known YouTube page types we want to detect.
 * 
 * The value of each enum member is a lowercase string identifier
 * that you can use in logs, conditionals, or analytics.
 */
export enum YouTubePageType {
  HomeOrExplore = 'home_or_explore',       // Homepage or Explore tab
  Search = 'search',                       // Search results page

  Watch = 'watch',                         // Standard watch page for a video
  WatchLive = 'watch_live',                 // Watch page for a live stream
  WatchPremiere = 'watch_premiere',         // Watch page for a premiere
  EmbedVideo = 'embed_video',               // Embedded video player page

  Shorts = 'shorts',                        // Shorts video page
  Clip = 'clip',                            // Clip page

  Playlist = 'playlist',                    // Playlist page (generic)
  PlaylistWatchLater = 'playlist_watch_later', // "Watch later" playlist
  PlaylistLiked = 'playlist_liked',         // "Liked videos" playlist
  PlaylistMix = 'playlist_mix',             // Auto-generated Mix playlist

  ChannelHome = 'channel_home',             // Channel root page
  ChannelTab = 'channel_tab',               // Specific channel tab (Videos, Playlists, Community, etc.)

  FeedSubscriptions = 'feed_subscriptions', // Subscriptions feed
  FeedHistory = 'feed_history',              // Watch history page
  FeedLibrary = 'feed_library',              // Library page
  FeedOther = 'feed_other',                  // Any other feed page

  Hashtag = 'hashtag',                       // Hashtag landing page
  Topic = 'topic',                           // Topic landing page
  LiveRedirect = 'live_redirect',            // Live redirect URL (before video watch page)

  Studio = 'studio',                         // YouTube Studio (creator backend)
  Music = 'music',                           // YouTube Music
  Kids = 'kids',                             // YouTube Kids

  Movies = 'movies',                         // YouTube Movies section
  Gaming = 'gaming',                         // YouTube Gaming section
  News = 'news',                             // YouTube News section
  Fashion = 'fashion',                       // YouTube Fashion section

  Unknown = 'unknown'                        // Unknown/unsupported page type
}

/**
 * Detects what type of YouTube page a given URL is.
 * Works for both absolute and relative URLs.
 * 
 * @param href - The URL to check (can be absolute or relative)
 * @returns One of the YouTubePageType enum values
 */
export function detectYouTubePageType(href: string): YouTubePageType {
  try {
    // Create a URL object. If href is relative, base it on youtube.com
    const url = new URL(href, 'https://www.youtube.com');

    // Pathname (e.g., "/watch", "/shorts/abc123")
    const p = url.pathname;

    // Query parameters as URLSearchParams object
    const q = url.searchParams;

    // ===== HOME & EXPLORE =====
    if (p === '/' || p === '/feed/explore') return YouTubePageType.HomeOrExplore;

    // ===== SEARCH RESULTS =====
    if (p === '/results' && q.has('search_query')) return YouTubePageType.Search;

    // ===== WATCH PAGES (normal, live, premiere) =====
    if (p === '/watch' && q.has('v')) {
      if (q.get('live') === '1') return YouTubePageType.WatchLive;
      if (q.has('premiere')) return YouTubePageType.WatchPremiere;
      return YouTubePageType.Watch;
    }

    // ===== EMBEDDED PLAYER =====
    if (p.startsWith('/embed/') && p.split('/')[2]) return YouTubePageType.EmbedVideo;

    // ===== SHORTS VIDEO =====
    if (p.startsWith('/shorts/')) return YouTubePageType.Shorts;

    // ===== CLIPS =====
    if (p.startsWith('/clip/')) return YouTubePageType.Clip;

    // ===== PLAYLISTS =====
    if (p === '/playlist' && q.has('list')) {
      const list = q.get('list') || '';
      if (list === 'WL') return YouTubePageType.PlaylistWatchLater; // Watch later
      if (list === 'LL') return YouTubePageType.PlaylistLiked;      // Liked videos
      if (/^RD/.test(list)) return YouTubePageType.PlaylistMix;     // Mix playlists
      return YouTubePageType.Playlist;
    }

    // ===== CHANNEL PAGES =====
    if (/^\/(channel\/|@|c\/|user\/)/.test(p)) {
      // If the URL ends with one of the known channel tabs
      if (/(\/videos|\/shorts|\/streams|\/live|\/playlists|\/community|\/about)$/.test(p))
        return YouTubePageType.ChannelTab;
      return YouTubePageType.ChannelHome;
    }

    // ===== FEEDS =====
    if (p.startsWith('/feed/')) {
      if (p === '/feed/subscriptions') return YouTubePageType.FeedSubscriptions;
      if (p === '/feed/history') return YouTubePageType.FeedHistory;
      if (p === '/feed/library') return YouTubePageType.FeedLibrary;
      return YouTubePageType.FeedOther;
    }

    // ===== HASHTAGS =====
    if (p.startsWith('/hashtag/')) return YouTubePageType.Hashtag;

    // ===== TOPICS =====
    if (p.startsWith('/topic/')) return YouTubePageType.Topic;

    // ===== LIVE REDIRECT =====
    if (p.startsWith('/live/')) return YouTubePageType.LiveRedirect;

    // ===== YOUTUBE STUDIO =====
    if (url.hostname === 'studio.youtube.com') return YouTubePageType.Studio;

    // ===== YOUTUBE MUSIC =====
    if (url.hostname === 'music.youtube.com') return YouTubePageType.Music;

    // ===== YOUTUBE KIDS =====
    if (url.hostname === 'www.youtubekids.com') return YouTubePageType.Kids;

    // ===== SPECIAL YOUTUBE SECTIONS =====
    if (p.startsWith('/movies')) return YouTubePageType.Movies;
    if (p.startsWith('/gaming')) return YouTubePageType.Gaming;
    if (p.startsWith('/news')) return YouTubePageType.News;
    if (p.startsWith('/fashion')) return YouTubePageType.Fashion;

    // ===== FALLBACK =====
    return YouTubePageType.Unknown;
  } catch (err) {
    console.error('Invalid URL passed to detectYouTubePageType:', href, err);
    return YouTubePageType.Unknown;
  }
}
