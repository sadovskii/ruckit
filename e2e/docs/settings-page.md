# Extension settings: features and edge cases

Ruckit's own UI, the **settings page** (`index.html` opened in a tab) and the **toolbar popup** (the same `index.html` in the browser's popup), and what should be tested. Sources: [ai/docs/PROJECT_GUIDE.md](../../ai/docs/PROJECT_GUIDE.md), [ai/docs/backlog.md](../../ai/docs/backlog.md) and the code in `src/app/`. Written for branch `feature/update-black-list-phrase`, where phrases were merged into the keywords list: the black list has two cards, Channels, and Keywords and phrases.

**Coverage key**
- `E2E:settings/…` is a test in [e2e/tests/settings](../tests/settings).
- `UNIT` is a Karma test of the shared storage code in `src/extension/black-list/**/*.spec.ts`.
- `KARMA` is an Angular "should create" spec only.
- `—` means not covered yet.

⚠ marks current behaviour that is probably a bug or a surprise. Before writing a test for it, decide whether the test should pin today's behaviour or the intended one.

## 1. How it works (short)

- **Same app, two views.** `AppComponent` calls `chrome.tabs.getCurrent()`:
  - in a tab, it renders the **settings page** (sidebar + content, "large" view),
  - with no tab (toolbar popup), it renders the **popup** (bottom navbar, "small" view).
- **Storage.** Everything is stored in `chrome.storage.sync`:

| Key | Content |
|---|---|
| `blch`, `blchito` | channels black list and its on/off flag |
| `blk`, `blkito` | keywords and phrases black list (one list) and its on/off flag |
| `blph`, `blphito` | **legacy** phrases list; moved into `blk` by the background script on startup and then removed |
| `hide-list` | hide-list options |
| `password` | password, stored as **plain text** |
| `free-password-period` | how long one unlock lasts |
| `theme` | light or dark theme |

- **Password lock.** While a password is set, any change that **weakens** a restriction needs the password: turning a list or option off, or opening "Manage restrictions" (which allows removing items). Changes that make restrictions **stronger** are always allowed: turning on, adding items.
- **Reaching YouTube.**
  - Black-list changes reach YouTube through storage. Removals and turning off also **reload all YouTube tabs**.
  - Hide-list changes are inserted into or removed from open YouTube tabs straight away.

Testing hint: the e2e tests open `chrome-extension://<id>/index.html` in a tab, which always shows the settings page. To test the **popup** view, open the real popup with `chrome.action.openPopup()` from the service worker (Chrome 127+). Alternatively, add a test-only way to force the small view.

## 2. App shell and navigation

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-NAV-01 | Open `index.html` in a tab | settings page with sidebar; start page shown | E2E:settings/navigation, settings/extension |
| ST-NAV-02 | Sidebar items | Start page (logo), About, Blacklist, Hidelist, Password, Settings, Support Ruckit, Give feedback; the active item is highlighted | E2E:settings/navigation |
| ST-NAV-03 | `index.html?action=blacklist` / `hidelist` / `settings` / `home` | opens that section; `action` is removed from the URL | E2E:settings/navigation |
| ST-NAV-04 | Unknown or missing `action` | start page | E2E:settings/navigation |
| ST-NAV-05 | Start page | random "demon" picture (1 of 12) + quote shown after the picture loads | E2E:settings/navigation |
| ST-NAV-06 | About page | mission/values texts | — |
| ST-NAV-07 | "Support Ruckit" | opens the Stripe donation page in a new tab | E2E:settings/navigation |
| ST-NAV-08 | "Give feedback" | opens the store review page **of the build's browser** (Chrome/Edge/Firefox/Opera) in a new tab | E2E:settings/navigation |
| ST-NAV-09 | Page language | UI follows the browser language (en, ru); missing keys would show the raw key | — |
| ST-NAV-E01 | Reload the settings page on a section | always starts on the start page again (section not kept) | — |
| ST-NAV-E02 ⚠ | "Open full settings" from the popup while a settings tab is already open | existing settings tabs are closed and one new tab opened. ⚠ The tab search uses the **Chrome store ID**, so in Edge or Opera, or any build with another ID, old tabs aren't found and duplicates pile up | — |

## 3. Popup

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-POP-01 | Open the toolbar popup | header with "Extended settings", Blacklist section, bottom navbar (Blacklist / Hidelist / Settings) | — |
| ST-POP-02 | Navbar switches | Blacklist, Hidelist and Settings (theme) shown in compact form | — |
| ST-POP-03 | "Extended settings" | opens the full settings page **at the section open in the popup** | — |
| ST-POP-04 | "Manage restrictions" in the popup | opens the full settings page at Blacklist (no dialog in the popup) | — |
| ST-POP-05 | Snack bar action in the popup | opens the full settings page | — |
| ST-POP-E01 ⚠ | Password-locked action in the popup, then "Enter password" | both the password dialog **and** the full settings page may open (two handlers on the same action). Check what really happens | — |

## 4. Black list settings

Two cards: **Channels** and **Keywords and phrases** (one list for single words and phrases; the separate Phrases card was removed). Each card has:
- an on/off toggle,
- an input with an "Add new" button (not on Channels),
- a "Manage restrictions" button,
- a count of hidden items.

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-BL-01 | Cards show stored state | exactly two cards; toggle = stored flag, count = number of stored items | E2E:settings/black-list |
| ST-BL-02 | Turn a list on | stored at once; YouTube starts filtering without reload | E2E:settings/black-list, mocked/settings-to-youtube |
| ST-BL-03 | Turn a list off | stored; **all YouTube tabs reload** | E2E:settings/black-list, mocked/settings-to-youtube |
| ST-BL-04 | Add a keyword or a phrase via the keywords card input | stored in `blk`, count +1, input cleared; YouTube applies it live | E2E:settings/black-list |
| ST-BL-05 | Channels card has no input | channels can only be added with the ✕ button on YouTube | E2E:settings/black-list |
| ST-BL-06 | Input and Add are disabled while the list is off | can't add to a turned-off list | E2E:settings/black-list |
| ST-BL-07 | Validation: empty input → Add | red input, nothing stored | E2E:settings/black-list |
| ST-BL-08 | Validation: longer than 30 characters | red input, nothing stored (max length 30) | E2E:settings/black-list |
| ST-BL-09 | Duplicate item | ignored (not stored twice) | E2E:settings/black-list, UNIT |
| ST-BL-10 | Count updates live when a channel is hidden on YouTube | count on the open settings page changes without reload | E2E:settings/black-list |
| ST-BL-11 | "Manage restrictions" disabled while the list is off | — | E2E:settings/black-list |
| ST-BL-12 | User updates from a version with a separate Phrases list | after the restart, the old phrases are in the Keywords and phrases card (no duplicates) and the legacy keys are gone | E2E:settings/black-list, UNIT |
| ST-BL-13 | Update when keywords were off and old phrases on | the merged list is on if the old phrases list had items; an empty old list doesn't turn it on; turned-off old phrases are kept in the list | E2E:settings/black-list, UNIT |

**Edge cases**

| ID | Edge case | Current behaviour / question | Covered by |
|---|---|---|---|
| ST-BL-E01 ⚠ | Input of only spaces (`"   "`) | passes "required", **is stored** and then matches almost every title | E2E:settings/black-list (fixme – needs a decision) |
| ST-BL-E02 ⚠ | Leading/trailing spaces (`" cats "`) | stored as typed (not trimmed); the item then only matches titles that have those spaces around the word | E2E:settings/black-list (fixme – needs a decision) |
| ST-BL-E03 | Same word with different case (`Cats`, `cats`) | stored as two items | — |
| ST-BL-E04 | Exactly 30 characters / emoji / Cyrillic / RTL | accepted and shown correctly | E2E:settings/black-list |
| ST-BL-E05 | Press Enter in the input | submits like "Add new"? (it's a `<form>`) | E2E:settings/black-list |
| ST-BL-E06 ⚠ | Sync quota: list larger than 8 KB | saving fails silently: the item seems added but disappears after reload | — |
| ST-BL-E07 | Settings open in two tabs | change in one shows in the other (storage listener) | — |

## 5. Manage restrictions dialog

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-MR-01 | Open "Manage restrictions" | dialog with the list sorted alphabetically (case-insensitive), the count, a search box, and for keywords and phrases a "New restriction" form | E2E:settings/manage-restrictions |
| ST-MR-02 | Search | filters the list (case-insensitive substring) | E2E:settings/manage-restrictions |
| ST-MR-03 | Search finds nothing | "The restriction is not found" + "Add new restriction" (keywords and phrases only) adds the search text | E2E:settings/manage-restrictions |
| ST-MR-04 | Empty list | "The restrictions list is empty"; search disabled | E2E:settings/manage-restrictions |
| ST-MR-05 | Remove an item (×) | removed from storage; count updates; **YouTube tabs reload** | E2E:settings/manage-restrictions |
| ST-MR-06 | Remove while a search filter is active | the right item is removed (index of the full list) | E2E:settings/manage-restrictions |
| ST-MR-07 | Add from the dialog form (a word or a phrase) | stored in `blk`; list and count update | E2E:settings/manage-restrictions |
| ST-MR-08 | Channels dialog | no add form; adding from search disabled | E2E:settings/manage-restrictions |
| ST-MR-09 | Channel hidden on YouTube while the channels dialog is open | list updates live | E2E:settings/manage-restrictions |
| ST-MR-10 | Close the dialog (✕ / backdrop) | closes; card shows the new count | E2E:settings/manage-restrictions |

**Edge cases**

| ID | Edge case | Current behaviour / question | Covered by |
|---|---|---|---|
| ST-MR-E01 | Long items (> 50 chars, channels up to 60) | shown cut to 50 + "…" | — |
| ST-MR-E02 | Opening the dialog sorts the stored list | stored order becomes alphabetical after the next save | — |
| ST-MR-E03 | Remove the last item while searching for it | search box is cleared | E2E:settings/manage-restrictions |
| ST-MR-E04 | Keywords and phrases list changed elsewhere while its dialog is open | the list in the dialog is **not** refreshed (live update only for channels) | — |
| ST-MR-E05 | Hundreds of items | list scrolls; search stays fast | — |

## 6. Hide list settings

Groups and options: **General** (Hide Shorts), **Home Feed** (Suggested Videos Grid), **Header** (Notifications Bell), **Watch page** (Pre-end Suggestions, End Screen Suggestions, Up-Next Sidebar, Comments Section), **Search results** (Topic Chips, Latest Posts, Suggestions Sections), **Video Thumbnails** (Thumbnail Blackout, Disable Hover Playback, Disable Hover Image). See [youtube-page.md](youtube-page.md#5-hide-list-css) for what each hides.

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-HL-01 | Page shows all groups and options with stored state | first install: only "Hide Shorts" on | E2E:settings/hide-list |
| ST-HL-02 | Turn an option on | stored; CSS inserted into **all open YouTube tabs** at once | E2E:settings/hide-list, mocked/settings-to-youtube |
| ST-HL-03 | Turn an option off | stored; CSS removed from open YouTube tabs at once (no reload) | E2E:settings/hide-list, mocked/settings-to-youtube |
| ST-HL-04 | Obsolete options (old values 2, 11, 12, 16, 17) | not shown | E2E:settings/hide-list |
| ST-HL-E01 | No YouTube tab open | only stored; applied when YouTube is opened | — |
| ST-HL-E02 | Toggle quickly on/off several times | final state stored and applied; no stuck CSS | E2E:settings/hide-list |
| ST-HL-E03 | Option changed in another settings tab / popup | other open settings views don't refresh (no storage listener in the hide list) | — |

## 7. Password

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-PW-01 | Turn "Password request" on | "Setting a password" dialog: password + confirm, both required, must match → stored; toggle on | E2E:settings/password |
| ST-PW-02 | Set-password dialog: passwords don't match / empty | error, nothing stored | E2E:settings/password |
| ST-PW-03 | Close the set-password dialog | nothing stored; toggle stays off | E2E:settings/password |
| ST-PW-04 | Turn "Password request" off | "Enter your password" dialog; correct password → password removed | E2E:settings/password |
| ST-PW-05 | Wrong password in the enter dialog | error on the field; dialog stays open | E2E:settings/password |
| ST-PW-06 | Change password: current + new + confirm | wrong current → error; new ≠ confirm → error; success → stored + "Setting is successfully edited" snack bar | E2E:settings/password |
| ST-PW-07 | Change-password form while no password is set | disabled | E2E:settings/password |
| ST-PW-08 | "Inquire password" period: 30 seconds / 1 minute | stored; default 30 s | E2E:settings/password |

### Password lock (restrictions)

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-LK-01 | Password set → turn a black-list or hide-list toggle **off** | blocked: snack bar "Editing is restricted" + "Enter password" | E2E:settings/password-lock |
| ST-LK-02 | Same, then "Enter password" + correct password | the toggle turns off; editing unlocked for the chosen period | E2E:settings/password-lock |
| ST-LK-03 | Password set → turn a toggle **on** | allowed without password | E2E:settings/password-lock |
| ST-LK-04 | Password set → "Manage restrictions" | blocked until the password is entered | E2E:settings/password-lock |
| ST-LK-05 | Password set → add a keyword or phrase | allowed (makes restrictions stronger) | E2E:settings/password-lock |
| ST-LK-06 | Unlock period ends (30 s / 1 min) | locked again; a lock icon shows on toggles | E2E:settings/password-lock |
| ST-LK-07 | Locked icons | lock icon on locked toggles and buttons | E2E:settings/password-lock |

**Edge cases**

| ID | Edge case | Current behaviour / question | Covered by |
|---|---|---|---|
| ST-PW-E01 ⚠ | Password stored as plain text in sync storage | readable by anyone with access to the browser profile or DevTools | E2E:settings/password (pins it) |
| ST-PW-E02 ⚠ | Unlock lasts only for **that** settings page or popup | opening another settings tab or the popup needs the password again; closing the page ends the unlock | E2E:settings/password-lock |
| ST-PW-E03 | Manage dialog already open when the unlock period ends | items can still be removed in the open dialog | — |
| ST-PW-E04 | Password with spaces, emoji, very long (set dialog has no max length; change form max 30) | can a password longer than 30 be set but never changed? | — |
| ST-PW-E05 | Forgotten password | no recovery in the UI; only clearing extension storage ("be very careful not to lose your password") | — |
| ST-PW-E06 | Change the period while unlocked | applies to the next unlock | — |
| ST-PW-E07 | Hide-list toggle blocked by the lock | the lock runs before the toggle changes, so nothing should change on YouTube. Worth a test | mocked/settings-to-youtube |

## 8. Settings (appearance)

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-AP-01 | Theme Light / Dark | applied at once; stored; used next time the settings page or popup opens | E2E:settings/appearance |
| ST-AP-02 | No stored theme | light (`default`) | E2E:settings/appearance |
| ST-AP-E01 | Theme changed in another tab | not applied to already open views until reload | — |

## 9. Snack bar

| ID | Scenario | Expected | Covered by |
|---|---|---|---|
| ST-SB-01 | Restricted action | "Editing is restricted" with "Enter password" action | E2E:settings/password-lock |
| ST-SB-02 | Successful password change | "Setting is successfully edited" | E2E:settings/password |
| ST-SB-03 | Snack bar disappears after a timeout, or when a new one appears | — | — |

## 10. Suggested next tests (by value)

Done: password lock, password dialogs, black-list cards, manage dialog, hide-list options, navigation and deep links, theme, settings → YouTube effects.

Still open:
1. ST-POP-* popup view. It first needs a way to open the popup in tests (`chrome.action.openPopup()` from the service worker, or a test-only switch).
2. ST-NAV-06 About page, ST-NAV-09 Russian UI (a run with `--lang=ru`), ST-NAV-E02 duplicate settings tabs in Edge.
3. ST-MR-E01 long items, ST-MR-E04 keyword list changed elsewhere while its dialog is open, ST-MR-E05 hundreds of items.
4. ST-PW-E03 removing in an open dialog after the unlock ended, ST-PW-E04 long or unusual passwords, ST-PW-E06 period changed while unlocked.
5. ST-HL-E01 no YouTube tab open, ST-HL-E03 change in another settings tab, ST-AP-E01 theme in another tab.
6. ST-BL-E03 case-variant duplicates, ST-BL-E06 sync quota, ST-BL-E07 two settings tabs.
7. Decisions behind the `fixme` tests: ST-BL-E01, ST-BL-E02. Then remove `.fixme`.
