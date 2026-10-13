# Ruckit — Critical Issues Backlog

## Runtime / Extension Layer

| # | Issue | Location | Impact | Priority |
|---|-------|----------|--------|----------|
| 1 | **No timer cleanup** — `setTimeout` loop in heartbeat never stops on page navigation | `src/extension/black-list/black-list-heartbeat.ts` | Memory/CPU leak across SPA navigations | 🔴 Critical |
| 2 | **Hardcoded YouTube selectors** — `#owner`, `ytd-video-renderer`, `yt-content-metadata-view-model` | All page handlers | Single YouTube redesign breaks the extension | 🔴 Critical |
| 3 | **Polling instead of MutationObserver** — 1s cycle misses fast DOM changes, wastes CPU | `src/extension/black-list/black-list-heartbeat.ts` | UX flicker; blocked content visible briefly | 🔴 Critical |
| 4 | **16-insertion limit** breaks infinite scroll | Feed/Search page handlers | Users see unfiltered items past the cap | 🟠 High |
| 5 | **Naive keyword matching** — `"hate"` also matches `"whatever"` | Video/Search page handlers | High false-positive rate | 🟠 High |
| 6 | **No error handling** on Chrome API calls | Throughout extension layer | Silent failures with no user feedback | 🟠 High |
| 7 | **Race condition** — storage init vs. `onChanged` listener registration | `src/extension/black-list/black-list-storage.ts` | Could miss updates during startup | 🟠 High |

## Angular UI Layer

| # | Issue | Location | Impact | Priority |
|---|-------|----------|--------|----------|
| 8 | **Unmanaged subscriptions** — `subscribe()` without `takeUntil` | `src/app/app.component.ts`, `src/app/settings/layout-content/black-list/black-list.component.ts` | Memory leaks | 🔴 Critical |
| 9 | **Excessive `detectChanges()`** calls | BlackList, HideList components | Performance; suggests broken change detection | 🟠 High |
| 10 | **Direct `chrome.runtime.sendMessage()`** in components | `src/app/settings/layout-content/black-list/black-list.component.ts` | Tight coupling, untestable | 🟡 Medium |
| 11 | **No error UI** — failed storage/injection operations invisible to user | All settings flows | Confusing silent failures | 🟡 Medium |
| 12 | **Monolithic module** — 33 components in one `AppModule` | `src/app/app.module.ts` | Slow compilation, poor encapsulation | 🟡 Medium |

## Security

| # | Issue | Location | Impact | Priority |
|---|-------|----------|--------|----------|
| 13 | **Password stored in plaintext** in `chrome.storage.sync` | Password component / GlobalService | Credential exposure | 🔴 Critical |
| 14 | **No input sanitization** — channel names truncated but not validated | BlackList storage | Could store unexpected chars | 🟡 Medium |
| 15 | **`innerHTML` template injection** for button — no CSP-safe DOM creation | `src/extension/black-list/button/black-list-button-templates.ts` | XSS vector if channel names rendered unsanitized | 🟡 Medium |

## Test Coverage

| # | Issue | Location | Impact | Priority |
|---|-------|----------|--------|----------|
| 16 | **Zero functional test coverage** — only component instantiation tested | All spec files | No regression safety net | 🔴 Critical |
| 17 | **Popup spec entirely commented out** | `src/app/popup/popup.component.spec.ts` | Dead test code | 🟡 Medium |

## Dead Code

| # | Issue | Location | Impact | Priority |
|---|-------|----------|--------|----------|
| 18 | **Empty file** `black-list-button.ts` | `src/extension/black-list/button/black-list-button.ts` | Confusion | 🟢 Low |
| 19 | **5 obsolete hide-list types** with `null` CSS mappings | Hide-list configuration | Misleading config entries | 🟢 Low |

## Multi-Browser Support (Completed)

| # | Status | Task | Notes |
|---|--------|------|-------|
| 20 | ✅ Done | Per-browser manifests in `manifests/` | chrome.json, edge.json, firefox.json, opera.json |
| 21 | ✅ Done | Webpack reads `BROWSER` env var | Copies correct manifest to output |
| 22 | ✅ Done | npm scripts per browser | `build:chrome`, `build:edge`, `build:firefox`, `build:opera`, `build:all` |
| 23 | ⬜ Todo | Replace `{your-firefox-addon-id}` in `manifests/firefox.json` | Required before Firefox Add-ons submission |
| 24 | ⬜ Todo | Test Firefox build with `background.scripts` | Verify no top-level await issues in background.js for Firefox |
| 25 | ⬜ Todo | Submit to Edge Add-ons, Firefox Add-ons, Opera Addons stores | Store-specific review requirements |

