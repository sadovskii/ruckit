# YouTube page: features and edge cases

What Ruckit does on `www.youtube.com`, and what should be tested. Sources: [ai/docs/PROJECT_GUIDE.md](../../ai/docs/PROJECT_GUIDE.md), [ai/docs/backlog.md](../../ai/docs/backlog.md) and the code in `src/extension/`, `styles/`, `src/app/settings/layout-content/hide-list/`. Written for branch `feature/update-black-list-phrase-tests`, where channels, keywords and phrases are three separate lists.

**Coverage key**
- `E2E:youtube/…` is a real-YouTube test in [e2e/tests/youtube](../tests/youtube).
- `E2E:mocked/…` is an offline test against fake pages in [e2e/tests/mocked](../tests/mocked).
- `UNIT` is a Karma test in `src/extension/black-list/**/*.spec.ts`.
- `—` means not covered yet.

⚠ marks current behaviour that is probably a bug or a surprise. Before writing a test for it, decide whether the test should pin today's behaviour or the intended one.

## 1. How it works (short)

- **Content script.** `black-list/black-list-heartbeat.js` is injected into every `www.youtube.com` page. Every **1 s** it detects the page type from the URL ([url-detector.ts](../../src/extension/url-detector.ts)) and runs that page's handler:
  - inject "hide channel" buttons,
  - remove matching items,
  - redirect blocked videos and channels.
- **Hide list.** CSS files from `styles/hide-list/` are injected into YouTube tabs:
  - by the background script on every top-level navigation (`webNavigation.onCommitted`),
  - by the settings UI straight away when an option is toggled.
- **Restricted page.** Blocked videos, channels and Shorts are replaced by `https://www.youtube.com/-rp`: YouTube's own 404 page, re-skinned with the "demon" picture, a quote and a "Go to the main page" button.
- **Storage.** Settings live in `chrome.storage.sync`:

| Key | Content |
|---|---|
| `blch` / `blchito` | blocked channels / channels list on |
| `blk` / `blkito` | keywords / keywords list on |
| `blph` / `blphito` | phrases / phrases list on |
| `hide-list` | hide-list options |

Content scripts follow storage changes live (`chrome.storage.onChanged`).

## 2. Page types

| ID | Page (URL) | What runs | Covered by |
|---|---|---|---|
| YT-PT-01 | Search `/results?search_query=` | buttons + removal (videos, channel results) | E2E:youtube/black-list, layout |
| YT-PT-02 | Home `/` and `/feed/explore` | buttons + removal (feed) | E2E:youtube/black-list (home feed), layout |
| YT-PT-03 | Watch `/watch?v=`, live `&live=1`, embed `/embed/<id>` | buttons + "up next" removal + redirect | E2E:youtube/black-list, layout |
| YT-PT-04 | Channel `/@x`, `/channel/`, `/c/`, `/user/` (+ tabs `/videos`, `/shorts`, …) | header button + redirect | E2E:youtube/black-list, layout |
| YT-PT-05 | Shorts `/shorts/<id>` | redirect when "Hide Shorts" is on | E2E:youtube/black-list (shorts), mocked/youtube-page |
| YT-PT-06 | Restricted page `/-rp` | 404 page re-skinned | E2E:youtube/black-list (watch redirect checks content) |
| YT-PT-07 ⚠ | Premiere `/watch?v=&premiere` | **nothing**: page type `WatchPremiere` isn't handled, so no redirect and no filtering | mocked/youtube-page (fixme – needs a decision) |
| YT-PT-08 ⚠ | Subscriptions, history, library, playlists, hashtag, topic, clips, gaming/news… | **no filtering, no buttons**. Only hide-list CSS applies | — |
| YT-PT-09 ⚠ | `m.youtube.com`, `music.youtube.com`, `youtube-nocookie.com`, YouTube embedded on other sites | content script doesn't match (manifest matches `www.youtube.com` only, top frame only) | — |
| YT-PT-10 | SPA navigation (click a video from search, back button) without a page reload | the heartbeat re-detects the page type every second, so the new page is handled | — |

## 3. Black list: channels

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| YT-CH-01 | "Hide channel" ✕ button on **search results** | one button next to each channel avatar (`#channel-info`) while the channels list is on | E2E:youtube/black-list, mocked/black-list-channels |
| YT-CH-02 | ✕ button on **home feed** items | next to the channel name in the metadata row | mocked/youtube-page |
| YT-CH-03 | ✕ button on **watch page** owner (under the video) | after the owner block | E2E:youtube/black-list, mocked/youtube-page |
| YT-CH-04 | ✕ button on **"up next"** sidebar items | only when the item's metadata has ≥ 2 children | — |
| YT-CH-05 | ✕ button on **channel page** header | after the header action buttons (Subscribe…) | E2E:youtube/black-list, mocked/youtube-page |
| YT-CH-06 | Click ✕ | channel display name (trimmed, cut to 60 chars) added to `blch`; its videos disappear on all open YouTube tabs within ~1 s | E2E:youtube/black-list, mocked/black-list-channels |
| YT-CH-07 | Click ✕ twice or on the same channel elsewhere | no duplicate in `blch` | UNIT (storage) |
| YT-CH-08 | Blocked channel in search results | its videos **and** its channel result (`ytd-channel-renderer`) are removed | mocked/black-list-channels (videos), mocked/youtube-page (channel results) |
| YT-CH-09 | Blocked channel on home feed / "up next" | its items are removed | mocked/youtube-page |
| YT-CH-10 | Open a **video** of a blocked channel | redirect to `/-rp` | E2E:youtube/black-list, mocked/youtube-page |
| YT-CH-11 | Open a blocked **channel page** | redirect to `/-rp` | E2E:youtube/black-list, mocked/black-list-channels |
| YT-CH-12 | Channels list turned off | no buttons (existing ones removed), nothing hidden, no redirect | mocked/black-list-channels |
| YT-CH-13 | Channels list turned on while a page is open | buttons appear and filtering starts without reload | mocked/youtube-page |

**Edge cases**

| ID | Edge case | Current behaviour / question | Covered by |
|---|---|---|---|
| YT-CH-E01 | Channel name longer than 60 chars | stored and compared as the first 60 chars, so two channels with the same first 60 chars are both blocked | mocked/youtube-page |
| YT-CH-E02 | Collaboration video ("A and B") | the name shown is "A and B", so that whole text is stored as one channel. Blocking it doesn't hide videos of A alone | — |
| YT-CH-E03 | Channel renamed, or name shown differently (handle `@x` vs display name, translated name) | matching is by **display text**, so a renamed channel is no longer blocked | — |
| YT-CH-E04 | Names with emoji, RTL text, extra spaces, HTML-like text (`<b>`) | trimmed and compared literally; no HTML injection (stored as text) | mocked/youtube-page |
| YT-CH-E05 ⚠ | More than 16 new items per second (fast infinite scroll) | buttons are inserted in batches of 16 per tick, so items further down get their button 1–2 s later | — |
| YT-CH-E06 ⚠ | Many blocked channels: `blch` larger than the sync per-item quota (8 KB) | `chrome.storage.sync.set` fails silently and the new channel isn't saved, with no message | — |
| YT-CH-E07 | Hide a channel in one tab, with other YouTube tabs and the settings page open | all tabs and the settings count update live | mocked/youtube-page |
| YT-CH-E08 | Click ✕ inside a video card | the click must not open the video (propagation is stopped) | — |
| YT-CH-E09 | Blocked items briefly visible | up to ~1 s of flicker (polling, no MutationObserver); acceptable or not? | — |

## 4. Black list: keywords and phrases

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| YT-KW-01 | Keyword in a **search result** title | result removed | E2E:youtube/black-list, mocked, UNIT |
| YT-KW-02 | Keyword in a **home feed** title | item removed (⚠ only while the channels list is on, see YT-KW-E01) | E2E:youtube/black-list, mocked, UNIT |
| YT-KW-03 | Keyword in an **"up next"** title | item removed | E2E:youtube/black-list ⚠ fails today (YT-BUG-01), mocked, UNIT |
| YT-KW-04 | Keyword in the **opened video** title | redirect to `/-rp` | E2E:youtube/black-list, mocked, UNIT |
| YT-KW-05 | Keyword in a **channel name** (channel page) | redirect to `/-rp` | UNIT, mocked/youtube-page |
| YT-KW-06 | Phrase in a title (search / feed / up next / opened video / channel name) | same as keywords | E2E:youtube/black-list (search), mocked, UNIT |
| YT-KW-07 | Keywords or phrases list turned off | nothing hidden by that list | mocked, UNIT |
| YT-KW-08 | Keyword added or list turned on while the page is open | applied without reload | mocked, UNIT |
| YT-KW-09 | Keyword removed or list turned off in settings | all YouTube tabs are **reloaded** (`blackListBecomeWeaker`), so hidden videos come back | mocked/settings-to-youtube |

**Matching rules (today)**
- **Keyword:** title lowercased and split by spaces, then `word.includes(keyword)`. Case-insensitive.
- **Phrase:** `title.includes(phrase)`. Case-sensitive.

**Edge cases**

| ID | Edge case | Current behaviour / question | Covered by |
|---|---|---|---|
| YT-KW-E01 ⚠ | Home feed while the **channels list is off** | keywords and phrases are **not applied** on the home feed (`FeedPage` returns early) | UNIT (pins it), mocked/youtube-page (fixme – needs a decision) |
| YT-KW-E02 ⚠ | Channel page with keywords/phrases **turned off** | still redirects when the channel name matches (toggles ignored); and nothing redirects at all while the channels list is off | UNIT (pins it) |
| YT-KW-E03 | Keyword is part of a longer word (`hate` in `whatever`) | matched (substring). False positives | UNIT, mocked/youtube-page |
| YT-KW-E04 | Keyword with different case (`CATS` vs `cats`) / Cyrillic case | matched | UNIT |
| YT-KW-E05 ⚠ | Phrase with different case (`How to` vs `how to`) | **not matched** (case-sensitive) | mocked/youtube-page (fixme – needs a decision) |
| YT-KW-E06 | Phrase spanning word parts (`king new` in `breaking news`) | matched | UNIT |
| YT-KW-E07 | Keyword containing a space (`cat video`) | never matches as a keyword (title is split by spaces); it only works as a phrase | mocked/youtube-page (fixme – needs a decision) |
| YT-KW-E08 | Punctuation and emoji next to the word (`cats!`, `cats😂`) | matched (substring of the word) | UNIT (punctuation) |
| YT-KW-E09 | Non-breaking spaces or multiple spaces in titles | words aren't split on NBSP, but substring still matches | — |
| YT-KW-E10 | Very short keyword (`a`) | hides almost everything; no minimum length | — |
| YT-KW-E11 | Same item in keywords and phrases | hidden once, no errors | UNIT |
| YT-KW-E12 | Title truncated by YouTube with "…" in the UI | the extension reads `textContent`, so the full title is used | — |
| YT-KW-E13 | Titles in other languages or auto-translated titles | matching uses the shown text, which depends on the account language | — |
| YT-KW-E14 ⚠ | Several keys changed in one `storage.set` | the content script applies only the **first** changed key (handler returns early) | — |
| YT-KW-E15 ⚠ | Home feed items that aren't plain videos: YouTube Playables (games), Shorts shelves, Mixes, ads | not filtered by keywords or phrases: the extension reads only the video title class (`.ytLockupMetadataViewModelHeadingReset`). Found by the e2e tests | — |

## 5. Hide list (CSS)

| ID | Option (group) | Hidden elements (selector) | Covered by |
|---|---|---|---|
| YT-HL-01 | Hide Shorts (General) | shorts shelves in search (`ytd-reel-shelf-renderer`, `grid-shelf-view-model:has(ytm-shorts-lockup-view-model)`), single shorts in search, "Shorts" sidebar link, channel Shorts tab + grid, shorts sections on home | E2E:youtube/hide-list (search shelves), mocked/hide-list, layout |
| YT-HL-02 | Hide Shorts: Shorts **page** | opening `/shorts/<id>` redirects to `/-rp` (JS, not CSS) | E2E:youtube/black-list (shorts), mocked/youtube-page |
| YT-HL-03 | Suggested Videos Grid (Home Feed) | `ytd-browse[page-subtype="home"] ytd-rich-grid-renderer` | E2E:youtube/hide-list |
| YT-HL-04 | Notifications Bell (Header) | `ytd-notification-topbar-button-renderer` | E2E:youtube/hide-list (signed in) |
| YT-HL-05 | Pre-end Suggestions (Watch) | `ytd-player .ytp-ce-element` | — |
| YT-HL-06 | End Screen Suggestions (Watch) | `.ytp-player-content button`, `.ytp-endscreen-content` | — |
| YT-HL-07 | Up-Next Sidebar (Watch) | `ytd-watch-next-secondary-results-renderer`, fullscreen suggestion grid | E2E:youtube/hide-list |
| YT-HL-08 | Comments Section (Watch) | `ytd-comments`, comments panel, player comments button | E2E:youtube/hide-list |
| YT-HL-09 | Topic Chips (Search) | `ytd-search-header-renderer yt-chip-cloud-renderer` | E2E:youtube/hide-list |
| YT-HL-10 | Latest Posts (Search) | `ytd-shelf-renderer:has(ytd-post-renderer)` | — |
| YT-HL-11 | Suggestions Sections (Search) | "People also watched"-type shelves, refinement cards | — |
| YT-HL-12 | Thumbnail Blackout (Thumbnails) | thumbnail images hidden (shown on hover) | — |
| YT-HL-13 | Disable Hover Playback (Thumbnails) | `ytd-video-preview`, moving thumbnails | — |
| YT-HL-14 | Disable Hover Image (Thumbnails) | hover image swap | — |

**Behaviour and edge cases**

| ID | Scenario | Expected / current behaviour | Covered by |
|---|---|---|---|
| YT-HL-E01 | Turn an option on in settings with YouTube tabs open | CSS inserted into **all open YouTube tabs** at once, no reload | mocked/settings-to-youtube |
| YT-HL-E02 | Turn an option off | CSS removed from open tabs at once, no reload | mocked/settings-to-youtube |
| YT-HL-E03 | Open a new YouTube tab or reload | CSS inserted on navigation commit (before content renders, so no flash) | E2E:youtube/hide-list (reload) |
| YT-HL-E04 | SPA navigation inside YouTube | CSS stays (inserted per tab, not per page) | — |
| YT-HL-E05 | Several options at once | all inserted, independent of each other | — |
| YT-HL-E06 ⚠ | Only obsolete types stored (values 2, 11, 12, 16, 17) | `insertCSS` may be called with an empty file list (bug in `runHideListCssScripts`) | — |
| YT-HL-E07 | Old users with obsolete options on | ignored. "Hide Shorts" (18) covers them | — |
| YT-HL-E08 | YouTube renames an element | option silently stops working. The layout tests catch the selectors listed there | layout (partial) |
| YT-HL-E09 | Hide Shorts + Shorts link in the collapsed (mini) guide | `a[title="Shorts"]` depends on the UI language? (title is "Shorts" in en/ru) | — |

## 6. Restricted page and redirects

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| YT-RP-01 | Any redirect (video, channel, Shorts) | tab navigates to `https://www.youtube.com/-rp` | E2E:youtube/black-list, mocked |
| YT-RP-02 | Restricted page content | YouTube 404 text removed; demon picture + quote + "Go to the main page" button; tab title "prohibited content - YouTube" | E2E:youtube/black-list (content element) |
| YT-RP-03 | "Go to the main page" button | opens `https://www.youtube.com/` | E2E:youtube/black-list |
| YT-RP-E01 | Back button from `/-rp` | goes back to the blocked page, which redirects again (loop?) | — |
| YT-RP-E02 | Blocked video opened from an external link or bookmark | redirected after load (video may start playing for ~1 s) | — |
| YT-RP-E03 | YouTube changes its 404 page (no iframe / no `#error-page-content`) | page stays an unstyled YouTube 404; script polls forever every 300 ms | — |
| YT-RP-E04 | Restricted page in another UI language | quote and button text localized (en/ru) | — |

## 7. Background / lifecycle

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| YT-BG-01 | First install | channels list **on**, "Hide Shorts" **on**, open YouTube tabs reloaded | mocked/youtube-page |
| YT-BG-02 | Extension update | nothing changes (settings kept) | — |
| YT-BG-03 | Settings changed on another device (sync) | content scripts update live | — |
| YT-BG-04 | Service worker asleep (MV3) when a redirect is requested | message wakes it, redirect happens | — |
| YT-BG-E01 ⚠ | Long-lived tab | heartbeat `setTimeout` loop never stops; new handler objects every second (memory/CPU) | — |
| YT-BG-E02 ⚠ | Storage read on startup vs. first change event | possible race: a change during `init()` can be missed | — |

## 8. Known bugs found by the e2e tests

| ID | Bug | Where | Found by |
|---|---|---|---|
| YT-BUG-01 | Keywords and phrases don't hide **"up next"** videos: YouTube renamed the title class `.yt-lockup-metadata-view-model__title` → `.ytLockupMetadataViewModelTitle` | `pages/video-page/video-page.ts` | E2E:youtube/black-list, youtube-layout (watch page) |

## 9. Suggested next tests (by value)

Done: Shorts redirect, blocked-channel video redirect, removing or turning off reloads YouTube, hide-list toggles reach open tabs live, home grid / up-next / comments / topic chips hidden, ✕ buttons on home, watch and channel pages, restricted-page home button.

Still open:
1. YT-HL-05/06 pre-end and end-screen suggestions. They need a video playing to its end; a short video works best.
2. YT-HL-10/11/12–14 latest posts, suggestion sections, thumbnail options (visible-when-off, hidden-when-on pattern).
3. YT-RP-E01 back button from the restricted page, and YT-RP-E02 blocked video from an external link.
4. YT-PT-10 SPA navigation: click a search result whose title matches a keyword.
5. YT-CH-E05 more than 16 new items per second, YT-CH-E06 sync quota, YT-KW-E14 several keys changed at once.
6. Decisions behind the `fixme` tests: YT-KW-E01, YT-KW-E05, YT-KW-E07, YT-PT-07. Then remove `.fixme`.
