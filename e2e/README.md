# E2E tests (Playwright)

Tests run on the **real youtube.com** in browser windows that **you open and sign in to once**. The tests attach to those windows through a DevTools port, then open and close their own tabs. When they finish they only disconnect, so the window, your tabs and the login stay.

## Dashboard

**Double-click [`e2e/dashboard.cmd`](dashboard.cmd).** It opens http://localhost:9300 in your browser. From there you can do everything by clicking:

| Card | Buttons |
|---|---|
| Chrome – local build, Edge – local build | Open window · Run YouTube page tests · Run settings page tests · Run all · "Build dist first" checkbox |
| Chrome – store version, Edge – store version | Open window · Install Ruckit (only while it isn't installed) · Run YouTube page tests · Run settings page tests · Run all |
| Fake YouTube pages (offline) | Run offline tests |

- Each card shows whether its window is open. Store-version cards also show whether Ruckit is installed in the window.
- Before a run starts, the dashboard checks the window is open and, for the store version, that Ruckit is installed. If not, it says what to do instead of starting.
- **Current run** shows the live output, has a **Stop** button, and a link to the report when the run finishes.
- **Previous runs** lists the last 30 runs: result, counts, failed tests, and links to the report and log.
- Only one run at a time. Run buttons are disabled while tests run or while the card's window is closed.
- The dashboard runs in a minimized window called "Ruckit e2e dashboard". Close it to stop the dashboard. It is reachable from this PC only.

`npm run e2e:dashboard` does the same as the `.cmd` file.

## Windows and accounts

| Project | Extension | Window | Port | Account |
|---|---|---|---|---|
| `local-chrome` | local build `dist/chrome`, loaded by the tests | Google Chrome, profile `e2e/.profiles/local-chrome` | 9222 | your account |
| `local-edge` | local build `dist/edge`, loaded by the tests | Microsoft Edge, profile `e2e/.profiles/local-edge` | 9223 | your account |
| `prod-chrome` | installed from the Chrome Web Store | Google Chrome, profile `e2e/.profiles/prod-chrome` | 9224 | test account |
| `prod-edge` | installed from Edge Add-ons | Microsoft Edge, profile `e2e/.profiles/prod-edge` | 9225 | test account |
| `mocked` | local build `dist/chrome` | Playwright's own Chromium, temporary | – | none |

- **Local and production use separate windows.** The local Chrome build has the same extension ID as the store version, and two copies of Ruckit on the same YouTube page would affect each other.
- **The local build is loaded with `Extensions.loadUnpacked`.** This DevTools command (`--enable-unsafe-extension-debugging`) is needed because Chrome ignores `--load-extension` since v137. Each run reloads the current `dist/` build.

### One-time setup of each window

Press **Open window** on the card. The window is opened normally, not by an automation tool, so Google lets you sign in. In the window:

1. Sign in on the Google tab. Use your account for local windows and the test account for store-version windows.
2. Only the web sign-in is needed. The windows run with browser sync turned off, so the tests' changes to the extension settings never reach your other browsers.
3. Store-version windows: install Ruckit from the store tab. Local windows: do **not** install it; the tests load your build.
4. Accept YouTube's cookie dialog if it appears.
5. Keep the window open. Minimizing it or covering it with other windows is fine; it's started with background throttling turned off.

If you close a window, or after a reboot, press **Open window** again. It reopens with the same profile, so you stay signed in.
The store keeps the store-version extension up to date as in a normal browser. Each run prints the version it tested.

**Never commit or share `e2e/.profiles/`.** It contains your login cookies; it is git-ignored.

## Tests

The tests are split into two groups, which the dashboard can run separately:

- **YouTube page tests** ([tests/youtube/](tests/youtube)) check what the extension does on youtube.com:
  - [youtube-layout.spec.ts](tests/youtube/youtube-layout.spec.ts): every selector the extension relies on still matches YouTube's HTML on the search, home, watch and channel pages. A failure names the selector and the extension file that uses it.
  - [black-list.spec.ts](tests/youtube/black-list.spec.ts): keywords, phrases, the "hide channel" button and redirects. YouTube's content changes daily, so tests pick a keyword or phrase from the titles currently shown, turn it on, and expect those videos to disappear.
  - [hide-list.spec.ts](tests/youtube/hide-list.spec.ts): first checks that the element is visible with the option off. This proves the selector still matches. Then it checks the element is hidden with the option on.
- **Settings page tests** ([tests/settings/](tests/settings)) check the extension's own settings page: navigation and deep links, black-list cards, the manage dialog, hide-list options, password and password lock, theme. They find elements by structure, not by text, so they work in English and Russian. Page helpers are in [support/settings-page.ts](support/settings-page.ts). Put new settings page tests in this folder.
- **Offline tests** ([tests/mocked/](tests/mocked)) check the YouTube behaviours against fake pages ([support/youtube-mock.ts](support/youtube-mock.ts)). [settings-to-youtube.spec.ts](tests/mocked/settings-to-youtube.spec.ts) checks how settings changes reach an open YouTube tab. The offline project also runs the settings page tests. They're fast, deterministic and work offline.
- **`test.fixme`** marks tests for ⚠ behaviour that needs a decision (listed in the feature lists). They show as skipped until `.fixme` is removed.

The home feed, the notifications bell and the home-page layout check need a signed-in window. Without one they fail with "Not signed in to YouTube in the … window".

**Feature lists:** [docs/youtube-page.md](docs/youtube-page.md) and [docs/settings-page.md](docs/settings-page.md) list every feature and edge case of the YouTube page and the settings page. Each has an ID (`YT-…`, `ST-…`) and the test that covers it. Start new tests from their "Suggested next tests" sections.

### Test data

- **Extension settings:** tests change `chrome.storage.sync` through the extension's service worker and restore the previous content after each test. In store-version windows this is the test account's extension data.
- **Other extensions:** every other extension in a test window is turned off, because ad blockers or other YouTube tools would change the pages under test.
- **Storage keys:** the keys in [support/storage-data.ts](support/storage-data.ts) are literal values on purpose. They are user data, and a renamed key must break the tests.

## Results

Every run gets its own folder `e2e/runs/<date-time>`, whether it was started from the dashboard, the daily task or a command. The folder holds:

- `report/`: the HTML report. It shows every test with its steps and errors, plus screenshots of the pages when a test failed.
- `summary.json`: the data shown in the dashboard's history.
- `test-results/`: the raw failure files.

The last 30 runs are kept. `e2e/runs/history.log` lists them, one line per run, followed by its failed tests.

## Daily run

```
powershell -ExecutionPolicy Bypass -File e2e/scripts/register-daily-task.ps1 -At 09:00
```

This registers the Windows task "Ruckit e2e daily". It runs [scripts/run-daily.ps1](scripts/run-daily.ps1) every day while you are logged on to Windows. If the PC was off at that time, it runs as soon as possible afterwards. Each run:

- tests the store version (`prod-chrome`, `prod-edge`), and reopens a window first if it was closed,
- is saved as `e2e/runs/<date-time>_daily`, with `output.log`, and appears in the dashboard,
- opens the report when something failed.

Remove the task: `Unregister-ScheduledTask -TaskName 'Ruckit e2e daily' -Confirm:$false`.

## Commands

Everything the dashboard does is also available as a command:

```
npm run e2e:open:local-chrome     # also :local-edge, :prod-chrome, :prod-edge
npm run e2e:local                 # build dist/, test it in both local windows
npm run e2e:local:chrome          # also :local:edge
npm run e2e:prod                  # store version in both prod windows
npm run e2e:prod:chrome           # also :prod:edge
npm run e2e:mocked                # offline tests
npm run e2e:daily                 # what the daily task runs
npm run e2e:report                # HTML report of the newest run
```

Run one group or one test without rebuilding: `npx playwright test -c e2e --project=local-chrome e2e/tests/settings` or `npx playwright test -c e2e --project=local-chrome e2e/tests/youtube/hide-list.spec.ts -g "shorts"`.
