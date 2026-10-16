# Ruckit — Project Guide (AI + dev reference)

Read this first. It replaces re-reading the codebase. Paths are relative to repo root.
Last full analysis: 2026-10-16.

## 1. What it is
Browser extension (MV3; Chrome/Edge/Firefox/Opera) that removes distractions on `www.youtube.com`.
Two features:
- **Blacklist** — hide content by **channel name**, **keyword**, **phrase** (JS DOM removal + redirect to a "restricted" page).
- **Hidelist** — hide YouTube UI sections (Shorts, comments, sidebar, etc.) via **injected CSS files**.
- Extra: optional **password** that locks settings from being weakened; **theme** select; donate/feedback links.

Two code worlds share one TS build:
- `src/extension/` — background service worker + content scripts (plain TS, no Angular).
- `src/app/` — Angular 18 app (NgModule, Nebular UI) used as **popup** and **full settings page** (same `index.html`).
- `styles/` — CSS files injected into YouTube (copied as-is to `dist/.../styles`).

## 2. Build
- Builder: `@angular-builders/custom-webpack:browser`, config [custom-webpack.config.ts](../../custom-webpack.config.ts).
- Extra webpack entries (output JS paths matter — referenced by manifest / `executeScript`):
  - `background` ← `src/extension/background.ts`
  - `black-list/black-list-heartbeat` ← main content script
  - `black-list/common/black-list-remove-prohibitive-element` ← injected on restricted page
  - `black-list/search-page/*` (3 entries) — **legacy, built but never injected**
- `topLevelAwait: true` (heartbeat uses top-level `await`).
- `BROWSER` env (chrome|edge|firefox|opera) → `DefinePlugin BROWSER_TARGET` + copies `manifests/<browser>.json` → `manifest.json`.
- Copies `assets/` and `styles/` (root folders, not `src/assets`).
- Scripts: `npm run build:chrome|edge|firefox|opera|all` → `dist/<browser>`; `npm run build` → chrome into `dist/df-youtube-angular`; `npm test` = Karma.
- `src/manifest.json` is **stale/unused** (v1.1.9). Real manifests: `manifests/*.json` (chrome v1.1.11).
- Imports use `src/...` absolute paths (tsconfig baseUrl).

## 3. Manifest essentials
Permissions: `storage, scripting, tabs, webNavigation`; host `*://www.youtube.com/*`.
Popup: `index.html`. Background: `background.js` (Firefox uses `background.scripts`).
Static content script on youtube: CSS `styles/blank.css`, `styles/black-list/black-list-button.css`; JS `black-list/black-list-heartbeat.js`.

## 4. Storage (chrome.storage.sync) — single source of truth
Keys in [src/app/shared/constants.ts](../../src/app/shared/constants.ts):

| Key | Const | Value |
|---|---|---|
| `blch` | STORAGE_BLACKLIST_CHANNELS | `string[]` channel names (≤60 chars, exact match) |
| `blchito` | ..._CHANNELS_IS_TURNED_ON | boolean |
| `blk` | STORAGE_BLACKLIST_KEYWORDS | `string[]` |
| `blkito` | ..._KEYWORDS_IS_TURNED_ON | boolean |
| `blph` | STORAGE_BLACKLIST_PHRASES | `string[]` |
| `blphito` | ..._PHRASES_IS_TURNED_ON | boolean |
| `hide-list` | HIDE_LIST_ID | `[HideListItemType, boolean][]` (serialized Map) |
| `password` | STORAGE_PASSWORD_ID | **plaintext** string |
| `free-password-period` | STORAGE_FREE_PASSWORD_PERIOD_ID | seconds (default 30) |
| `theme` | STORAGE_THEME_ID | Nebular theme name |

Short keys exist to save sync quota (`background.ts` logs quota usage on start).
Mapping enum→key: `blackListRestrictionTypeToStoreMap` / `...TurnOnMap` in [black-list.models.ts](../../src/app/settings/layout-content/black-list/black-list.models.ts). `BlackListRestrictionType` = `'channel'|'keyword'|'phrase'`. `MAX_LENGTH_RESTRICTION = 30` (UI input limit).

Communication UI ↔ content scripts is **only through storage** (`chrome.storage.onChanged`) plus 2 runtime messages (below).

## 5. Extension runtime (`src/extension`)

### background.ts (service worker)
- `onInstalled('install')`: turn channels blacklist ON, enable hidelist `GeneralHideShorts`, reload YouTube tabs.
- `webNavigation.onCommitted` (frameId 0, youtube) → `runHideListCssScripts`: reads `hide-list`, `insertCSS` for enabled items via `HidelistCssConfiguration`.
- `tabs.onUpdated` status `complete` → `runBlackListScriptsByUrl`: if URL is `https://www.youtube.com/-rp` → executeScript `black-list-remove-prohibitive-element.js`.
- Messages:
  - `{restrictedPage: true}` (from content script) → navigate sender tab to `https://www.youtube.com/-rp` (a non-existent YT URL = YT 404 page that gets re-skinned).
  - `{blackListBecomeWeaker: true}` (from Angular when item removed / toggle off) → reload all YouTube tabs (removed DOM can't come back otherwise).

### background-functionality.ts
`runBlackListScriptsByUrl`, `runHideListCssScripts` (described above).

### black-list/black-list-heartbeat.ts (main content script)
- Creates `BlackListStorage` + `HideListStorage`, `init()` + onChanged handlers (top-level await).
- **Polls every 1000 ms**: `detectYouTubePageType(location.href)` → per-page handlers (new instances each tick):

| Page type | Handlers |
|---|---|
| Search | `SearchPage.blackListButtonOnSearch()`, `.blackListRemoveElements()` |
| HomeOrExplore | `FeedPage.blackListButton()`, `.blackListRemoveElements()` |
| ChannelHome/ChannelTab | `ChannelPage.blackListButton()`, `ChannelPageRedirect.channelPageRedirect()` |
| Watch/WatchLive/EmbedVideo | `VideoPage.blackListButton()`, `.blackListInjectAndRemoveElements()`, `VideoPageRedirect.videoPageRedirect()` |
| Shorts | `ShortPageRedirect.channelPageRedirect()` (redirect if hidelist GeneralHideShorts on) |

### url-detector.ts
`YouTubePageType` enum + `detectYouTubePageType(href)` (pure function, path/query based). Good unit-test target.

### Storage classes
- [black-list-storage.ts](../../src/extension/black-list/black-list-storage.ts) `BlackListStorage`: getters `channels/keywords/phrases`, `*IsTurnedOn`, `channelMap` (Map for O(1) lookup); `init()`, `setBlackListChannel()`, `addBlackListItem()`, `removeBlackListItem(index)`, `setBlackListTutnedOn()` (sic), `initHandler()`. Fields are `protected` because Angular's `BlackListStorageService` **extends** it.
- [hide-list-storage.ts](../../src/extension/hide-list/hide-list-storage.ts) `HideListStorage`: `hideListMap`, `generalShorts`, `addHideListItem()`.

### Page handlers (`black-list/pages/*`)
Common pattern in each:
- **Button inject**: `TEMPLATE` (from `button/black-list-button-templates.ts`, root class `.blb-conainer` — typo is the real selector, keep it) inserted next to channel name; click → `setBlackListChannel(name)` (trim, cut to 60). Removed when channels toggle off.
- **Removal**: for each item: channel in `channelMap` → `remove()`; keyword: title lowercased, split by space, `word.includes(keyword)`; phrase: case-sensitive `title.includes(phrase)`.
- **Redirect** pages (video/channel/shorts) send `{restrictedPage:true}`.
- Feed/Search button inject capped at 16 per tick (`maxInsertionsPerRun`), iterates reversed.

Key YouTube selectors (fragile, change here when YT breaks):
- Search: `ytd-video-renderer`, `#channel-info`, `#channel-thumbnail`, `ytd-channel-name .yt-simple-endpoint`, `#video-title`, `ytd-channel-renderer`.
- Feed: `ytd-rich-item-renderer`, `yt-content-metadata-view-model`, `.ytContentMetadataViewModelMetadataRow a.ytAttributedStringLink`, title `.ytLockupMetadataViewModelHeadingReset`.
- Watch: `#owner`, `ytd-video-owner-renderer #channel-name`, sidebar `ytd-item-section-renderer yt-lockup-view-model`, `.yt-lockup-metadata-view-model__title`, redirect uses `ytd-watch-flexy ytd-watch-metadata`.
- Channel: `yt-page-header-renderer yt-flexible-actions-view-model`, name `yt-dynamic-text-view-model h1 span`, `ytd-browse[page-subtype="channels"]`.
- Shorts: `ytd-shorts`.

### Restricted page
`common/black-list-remove-prohibitive-element.ts`: on `/-rp`, polls (300 ms) for YT 404 iframe `#error-page-content`, removes text, replaces image with `blackListProhibitiveElement` (inline SVG demon + quote + "Go to main page").

### Dead / legacy code (safe to ignore)
- `black-list/search-page/*` — old MutationObserver-based search filter; built, never injected.
- `common/common-functionality.ts` (`getBlackListData`), `black-list-models.ts` (`BlackListData`, `BlackListChannel`) — used only by legacy.
- `button/black-list-button.ts` (empty), `button/black-list-button-ingestion.ts` (unused), `common/percent-encoding.ts` (imported, unused), `*.html` templates next to TS.

## 6. Hidelist
- Model/enums: [hide-list.models.ts](../../src/app/settings/layout-content/hide-list/hide-list.models.ts) — `HideListItemType` (numeric enum 1..18, **values persisted, never reorder**), `HideListItemGroupType`.
- [hide-list.configuration.ts](../../src/app/settings/layout-content/hide-list/hide-list.configuration.ts):
  - `HideListModelConfiguration(map)` → UI groups: General(Hide Shorts), Home Feed, Header, Watch page, Search results, Video Thumbnails.
  - `HidelistCssConfiguration[type]` → `styles/hide-list/*.css` path; obsolete types map to `null` (SidebarShortsTab, SearchResultsShortsShelf, SearchResultsSingleShorts, ChannelPageShortsTab, ShortsPageShortsSection — merged into `general-hide-shorts.css`).
- Apply flow: toggle in UI → `ChromeService.insertCssToYoutube` / `removeCssToYoutube` on all open YT tabs + save map. On navigation, background re-inserts from storage.
- Add new hide option: add enum value at END → CSS file in `styles/hide-list/` → `HidelistCssConfiguration` entry → item in `HideListModelConfiguration`.
- CSS files only use `display: none !important` style rules with YT selectors.

## 7. Angular app (`src/app`)
- Single `AppModule` ([app.module.ts](../../src/app/app.module.ts)), all components declared there. Nebular (`NbLayout`, `NbSidebar`, `NbDialog`, `NbToggle`, `NbSelect`, eva icons). Mix of `*ngIf` and new `@switch` control flow.
- [app.component](../../src/app/app.component.html): `chrome.tabs.getCurrent()` → tab exists ⇒ full page `<app-settings>`, undefined ⇒ popup `<app-popup>`. Also loads password flag, theme, and the free-session timer.
- **Popup** (`popup/`): header ("Extended settings" button), content switch by `PopupNavbarItemType` (BlackList/HideList/Settings), bottom fixed `popup-navbar`, `popup-global` sets popup size, snack bar. Reuses settings components with `[viewVersion]="ViewVersions.small"`.
- **Settings page** (`settings/`): `nb-sidebar` + `SideBarItemsType` switch: Header(start page), AboutExtension, BlackList, HideList, Password, Settings. Opened via `ChromeService.openIndexToNewTab(action)` → closes existing extension tabs, opens `index.html?action=blacklist|hidelist|settings|home`; `SettingsComponent` reads and strips `action`.
- `ViewVersions` {small=1 popup, medium, large=settings} drives layout differences.

### Layout-content components
- `black-list/` — `BlackListComponent` uses `BlackListStorageService` (extends extension `BlackListStorage`, adds `handler$` Subject + add/removeHandler on `chrome.storage.onChanged`). 3 × `BlackListSimpleItemComponent` (toggle, input+Add, Manage restrictions, count). Manage → `NbDialog` `BlackListManageRestrictionsComponent` (large view) or emit to open full page (small view). **Channels cannot be added from UI** (`onAddItem` returns for channels) — only via YouTube button. Removing/turning off sends `blackListBecomeWeaker`.
- `hide-list/` — `HideListComponent` → `HideListBlockComponent` → `HideListBlockItemComponent`.
- `password/` — `PasswordComponent` (toggle to set/remove password, free-period select), dialogs `SetNewPasswordComponent`, `EnterPasswordComponent`, `ChangePasswordComponent`; `PasswordService` compares plaintext.
- `inner-settings/` — theme select (`NebularThemes`).
- `start-page/`, `about-extension/`, `shared/layout/` (`app-layout` with `header` + viewVersion).

### Shared
- `services/chrome/chrome.service.ts` — Observable wrappers: `storageSyncGet/Set/SetMap/Remove`, `insertCssToYoutube`, `removeCssToYoutube`, `openIndexToNewTab`, (unused) registered content script helpers. Provided in AppModule.
- `services/global/global.service.ts` — restriction state: `_isRestricted$ {hasPassword, isPasswordFreeSession}`; `getIsRestricted$` = hasPassword && !freeSession. `setIsPasswordFreeSession$(true)` triggers AppComponent `debounce` timer (period seconds) that sets it back to false.
- `directive/restricted-toggle` — on `ruckit-toggle` (via NgControl): if locked and turning OFF (weakening) → snack bar "Editing is restricted" + "Enter password" → `EnterPasswordComponent` → free session → apply. Turning ON is always allowed.
- `directive/restricted-button` — same for buttons; `[lock]` input, `(restricedClick)` output (sic).
- `components/`: `ruckit-toggle` (CVA), `ruckit-dialog`, `ruckit-password-input`, `ruckit-option-list`, `ruckit-snack-bar` (+ `RuckitSnackBarService`: `success()`, `restricted()`, `action$`), `tag`.
- `nbIcon-library-register.service.ts` + `src/assets/ruckit-icons.ts` — custom SVG icon pack.
- `pipes/safe.pipe.ts`, `validators/match.validator.ts`.
- `constants.ts` also: `EXTENSION_IDENTIFIER`, per-browser review URLs (`BROWSER_TARGET`), `DEMON_SVGS` (assets/demons), `DONATION_STRIPE_PAGE`, `BACKDROP_CLASS`.

## 8. End-to-end flows
1. **Block channel**: user clicks ✕ button on YT → `setBlackListChannel` → sync storage → all content scripts' `onChanged` update `channelMap` → next heartbeat tick removes items; open settings UI updates via `handler$`.
2. **Unblock / toggle off**: UI → storage + `blackListBecomeWeaker` → background reloads YT tabs.
3. **Hidelist toggle**: UI → insert/remove CSS on open tabs + storage; future navigations → background `onCommitted` inserts CSS.
4. **Watch blocked video / channel / short**: redirect handler → message → background navigates to `/-rp` → on complete injects prohibitive-element script.
5. **Password**: weakening actions blocked by restricted directives until password entered; unlock lasts `free-password-period` seconds (popup/settings lifetime only).

## 9. Known bugs / quirks (found in analysis, not yet fixed)
- `BlackListStorage.handler` and `BlackListStorageService._handlerListener` **return after first matched key** → if several keys change in one `set`, only one is applied.
- `FeedPage.blackListRemoveElements` returns early when channels toggle is off → keywords/phrases not applied on home feed in that case.
- `ChannelPageRedirect` checks keywords/phrases **ignoring their toggles**, and only runs if channels toggle on.
- Phrase match is case-sensitive; keyword match is substring-of-word (`"hate"` matches `"whatever"`).
- `BlackListStorage` default `phrase: true` before init.
- Heartbeat creates new handler instances every second; no MutationObserver; 16-insert cap per tick.
- `runHideListCssScripts` checks `keys.length` instead of `keysNotNullabe.length` (insertCSS with empty files possible).
- Password stored plaintext; `PasswordComponent` subscribes to `getHasPassword$` without adding to subscriptions.
- `innerHTML` used for button template (static string, low risk).
See also [backlog.md](backlog.md) and [plan.md](plan.md).

## 10. Conventions / gotchas for edits
- Keep storage keys and `HideListItemType` numeric values stable (user data in sync storage).
- Content-script code must not import Angular; it may import plain models/constants from `src/app/...` (already does).
- New content-script entry → add to `custom-webpack.config.ts` entry list and reference the emitted `.js` path.
- Channel names are compared by **display text**, trimmed and truncated to 60 chars everywhere — keep consistent.
- Specs are mostly boilerplate "should create"; `popup.component.spec.ts` commented out.

## 11. Localization (chrome.i18n)
- Strings live in root `_locales/<locale>/messages.json` (copied by CopyPlugin). `en` is `default_locale` in all `manifests/*.json`; manifest name/description use `__MSG_ext_name__` / `__MSG_ext_description__`.
- Key naming: snake_case, `<area>_<thing>` (`blacklist_*`, `hidelist_group_*`, `hidelist_item_*`, `password_*`, `settings_*`, `snackbar_*`, `common_*`). Counts use `$COUNT$` placeholder → `$1`.
- Templates: `{{ 'key' | i18n }}`, `[input]="'key' | i18n"`, with substitution `{{ key | i18n: n }}` (`I18nPipe` in `src/app/shared/i18n/i18n.pipe.ts`).
- TS / content scripts: `t(key, subs?)` from `src/app/shared/i18n/i18n.ts` (falls back to key outside the extension).
- Per-restriction-type keys: `blackListRestrictionTypeToMessageKeys` in `black-list.models.ts`. Hidelist config stores `nameKey`. Snackbar action labels: `snackbarActionTypeToMessageKey`.
- Add a language = add `_locales/<code>/messages.json` with the same keys. Not localized: `src/index.html` `<title>`, unused `.html` reference copies in `src/extension`, stale `src/manifest.json`.
