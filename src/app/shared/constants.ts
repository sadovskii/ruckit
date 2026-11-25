export const EXTENSION_IDENTIFIER = "eakiedfceboebghgkpciddfaghpednlb";
export const CHROME_WEBSTORE_REVIEWS_URL = `https://chromewebstore.google.com/detail/youtube-focus-remove-dist/${EXTENSION_IDENTIFIER}/reviews`;

declare const BROWSER_TARGET: string;

const STORE_REVIEWS_URLS: Record<string, string> = {
  chrome: `https://chromewebstore.google.com/detail/youtube-focus-remove-dist/${EXTENSION_IDENTIFIER}/reviews`,
  edge: `https://microsoftedge.microsoft.com/addons/detail/jlcgbbelbhaedigmbedelliiogfobpco`,
  firefox: `https://addons.mozilla.org/en-US/firefox/addon/youtube-focus/reviews/`,
  opera: `https://addons.opera.com/en/extensions/details/youtube-focus/`
};

export const EXTENSION_REVIEWS_URL = STORE_REVIEWS_URLS[typeof BROWSER_TARGET !== 'undefined' ? BROWSER_TARGET : 'chrome'] || STORE_REVIEWS_URLS['chrome'];
// storage ids
export const HIDE_LIST_ID = "hide-list";
export const STORAGE_PASSWORD_ID = "password";
export const STORAGE_FREE_PASSWORD_PERIOD_ID = "free-password-period";
// how long a password reset waits before the password is removed, in minutes; saved together with the password
export const STORAGE_PASSWORD_RESET_DELAY_ID = "password-reset-delay";
// time (ms since epoch) when a started password reset removes the password; exists only while a reset is pending
export const STORAGE_PASSWORD_RESET_ENDS_AT_ID = "password-reset-ends-at";
export const STORAGE_THEME_ID = "theme";
// theme YouTube itself is showing ('dark' | 'light'); kept in chrome.storage.local because it belongs to this browser, not the account
export const STORAGE_YOUTUBE_THEME_ID = "youtube-theme";
export const STORAGE_BLACKLIST_CHANNELS = "blch";
export const STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON = "blchito";
// values are users' saved data: "blk" is from before phrases were merged in; never rename the values
export const STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES = "blk";
export const STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON = "blkito";
// Legacy: the phrases list was merged into the keywords and phrases list. Kept only to migrate existing users' data.
export const LEGACY_STORAGE_BLACKLIST_PHRASES = "blph";
export const LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON = "blphito";

export const PASSWORD_RESET_DELAY_OPTIONS_MINUTES = [1, 240, 1440];
// passwords saved before the reset feature have no delay saved; the longest delay is the safest
export const DEFAULT_PASSWORD_RESET_DELAY_MINUTES = 1440;

// for nb dialog
export const BACKDROP_CLASS = 'custom-backdrop';

export const DEMON_SVGS = {
    "demon-barbed": "assets/demons/demon-barbed.svg",
    "demon-chained": "assets/demons/demon-chained.svg",
    "demon-champion": "assets/demons/demon-champion.svg",
    "demon-choice": "assets/demons/demon-choice.svg",
    "demon-drowsy": "assets/demons/demon-drowsy.svg",
    "demon-meditation": "assets/demons/demon-meditation.svg",
    "demon-mirror": "assets/demons/demon-mirror.svg",
    "demon-monitor": "assets/demons/demon-monitor.svg",
    "demon-muscle": "assets/demons/demon-muscle.svg",
    "demon-navigation": "assets/demons/demon-navigation.svg",
    "demon-time": "assets/demons/demon-time.svg",
    "demon-training": "assets/demons/demon-training.svg"
}

export const DONATION_STRIPE_PAGE = 'https://donate.stripe.com/00wfZj5E6bZVeEEfA8djO00';