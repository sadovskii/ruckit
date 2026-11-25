# Forgot password / reset: implementation plan

Status: **plan only, nothing implemented.** Design and copy notes: [forgot-password-reset.md](forgot-password-reset.md).

## Goal

1. Add a "Forgot password?" button to the password entering dialog.
2. Show a reset timer in the password entering dialog while a reset is pending (with "Cancel reset").
3. Add a reset confirmation popup ("Reset password?").
4. Add a "reset after" choice to setting a password. Only three options: **1 hour, 4 hours, 1 day**.

Rule for the UI: keep the old design system (Nebular + `ruckit-*` components, theme variables in `src/app/shared/styles`). Reuse what exists and keep it as it is. Build only what is missing, matching the SVG.

## How it works today (what the plan builds on)

- The password is stored as plain text in `chrome.storage.sync` under `password` (`STORAGE_PASSWORD_ID`). Only the Angular UI reads it. No content script or background code does, so nothing in `src/extension/` has to change.
- `EnterPasswordComponent` is one dialog used by three callers: `PasswordComponent` (turn the request off), `RestrictedToggleDirective` and `RestrictedButtonDirective` (unlock for a free session). Changes inside the dialog cover all three callers.
- `SetNewPasswordComponent` is the "Setting a password" dialog. `ChangePasswordComponent` is the inline change form (not in the design).
- Shell for all dialogs: `ruckit-dialog` (header tag + close X + title + divider + content). The tag is `app-tag` (red or green).
- `GlobalService` keeps `hasPassword` and the password-free session in memory. `AppComponent` loads `hasPassword` at start.

## Decisions (please confirm the starred ones)

1. **What "reset" means:** a delayed, cancellable reset. "Start reset" saves the end time. When the time is over, the password is deleted (password request turns off). There is no email, so the delay is the protection.
2. **The delay is chosen when the password is set** (1 hour, 4 hours or 1 day) and stored with the password.
3. **No timers in the background.** Store absolute timestamps and check them whenever the UI looks at the password (app start, dialog open, a 1 s tick while a dialog is open). This needs no new manifest permission (no `alarms`), so no store re-review.
4. **New storage keys** (nothing existing is renamed, so no migration):
   - `password-reset-delay`: delay in minutes, set with the password.
   - `password-reset-ends-at`: end time in ms, present only while a reset is pending.
   Stored in `chrome.storage.sync`, like the password.
5. **Existing users** have a password but no delay. Treat a missing delay as **1 day** (the safest).
6. **Entering the correct password cancels a pending reset.** *
7. **Cancel reset needs no password** (it only keeps the lock). *
8. **Default selected option** when setting a password: the middle one, **4 hours**, as in the design (3 days was the middle one there). *
9. **Changing the password** (`ChangePasswordComponent`) keeps the current delay. No delay control is added there. *
10. **Same dialog, two views:** the confirmation popup is shown inside the enter-password dialog (view `enter` or `confirmReset`) instead of stacking a second dialog. Callers stay unchanged, and "Go back" just switches the view.

## New and reused components

| Piece | Status | Notes |
|-------|--------|-------|
| `ruckit-dialog` | reuse | Unchanged shell. |
| `app-tag` | extend | Add an optional `icon` input (header pill icon). Default stays icon-less, so other dialogs are untouched. |
| `ruckit-password-input` | reuse | Eye icons already exist. |
| `nbButton` (primary / outline) | reuse | "Go back" is the existing outline button. Add one theme variable for its border if the theme lacks it. |
| `ruckit-info-block` | **new** (`shared/components`) | Icon + bold line + up to two grey lines. Used by: reset confirmation (90 px), reset in progress (72 px, with live time), setting password (90 px). |
| `ruckit-pill-group` | **new** (`shared/components`) | Three radio pills (32 px). A `ControlValueAccessor`. Selected pill has the red fill. Used for the delay choice. |
| `ruckit-link-button` | **new** (`shared/components`) | Small grey centred text button: "Forgot password?" and "Cancel reset". |
| `ResetPasswordConfirmComponent` | **new** (in `password/`) | The "Reset password?" view: intro text, info block, "Start reset", "Go back". Presentational, with outputs `start` and `back`. |
| `PasswordResetService` | **new** (`password/`) | State and rules (below). |
| Icons | **new** | See the icons section. |

## Steps

Each step ends with a working build. Do them in order.

### 1. Constants and service

- `src/app/shared/constants.ts`: add `STORAGE_PASSWORD_RESET_DELAY_ID` and `STORAGE_PASSWORD_RESET_ENDS_AT_ID`. Add `PASSWORD_RESET_DELAYS_MINUTES = [60, 240, 1440]` and `DEFAULT_PASSWORD_RESET_DELAY_MINUTES = 1440` (the fallback for old users).
- `password/password-reset.service.ts`:
  - `state$`: `{ status: 'none' } | { status: 'pending', endsAt, remainingMs }`.
  - `start()`: write `endsAt = now + delay`.
  - `cancel()`: remove `endsAt`.
  - `finalizeIfExpired()`: if `endsAt <= now`, remove `password`, `delay` and `endsAt`, then `GlobalService.setHasPassword$(false)`. Returns whether it reset the password.
  - A 1 s ticker, only while someone subscribes to `state$`.
  - Listen to `chrome.storage.onChanged`, so the popup and the settings page stay in step.
- Extend `PasswordService`: `setPassword(password, delayMinutes)` writes both keys. A correct `submitEnterPassword` also cancels a pending reset. Turning "Password request" off removes the reset keys.
- Call `finalizeIfExpired()` in `AppComponent.initIsRestricted()` before reading the password.
- Unit tests (`password-reset.service.spec.ts`): no reset, pending, expired at start, cancel, missing delay falls back to 1 day, correct password cancels.

### 2. Shared UI pieces and icons

- Icons from the new SVG export, added to `src/assets/ruckit-icons.ts` and registered in `IconRegisterService`: **clock**, **shield-alert**, **key** (header pill of the in-progress view), **password dots** and **padlock** (header pills). `closed-lock-16` already exists, so check whether it can be the padlock before adding a new one. Add a radio on/off icon for the pills (or draw the radio in CSS).
- Out of scope for this feature: the theme icons (sun, moon, monitor), the badge, the "?" / "!" glyphs, and the other header icons (document, tag, bubble, receipt). They are in the same export but not used by these screens.
- Build `ruckit-info-block`, `ruckit-pill-group`, `ruckit-link-button`. Declare them in `app.module.ts`. Colours go through theme variables (add to `dark-theme-settings.scss` and `default-theme-settings.scss`), never hard-coded hex.
- Extend `app-tag` with the optional `icon` input.
- Specs for each new component, in the style of the existing `*.component.spec.ts`.

### 3. Forgot password button and reset timer (items 1 and 2)

- `EnterPasswordComponent`:
  - Inject `PasswordResetService`, subscribe to `state$` (with `async` pipe or the existing `_subscription`).
  - View `enter`, no reset pending: the dialog as today plus the "Forgot password?" link under the button.
  - View `enter`, reset pending: header tag becomes the new in-progress label, an info block shows the clock and the remaining time (ticking), the link becomes "Cancel reset". The password input and the confirm button still work.
  - When the timer ends while the dialog is open: `finalizeIfExpired()` deletes the password, the dialog closes and emits as if unlocked. A snackbar tells the user the password was reset.
- Time format helper: "59 min", "3 h 12 min", "23 h 59 min". Put it in a small pure function so it is easy to test.

### 4. Reset confirmation popup (item 3)

- Add `ResetPasswordConfirmComponent` and switch to it from "Forgot password?".
- "Start reset": `PasswordResetService.start()`, then back to view `enter` (now in progress). "Go back": view `enter`, nothing changes.
- The info block shows the delay that was chosen when the password was set (for example "Reset in 4 hours").

### 5. Reset after, when setting a password (item 4)

- `SetNewPasswordComponent`: add a `delay` control (default 240) and a `ruckit-pill-group` with the three options, a short label above it, and a `ruckit-info-block` (shield-alert) explaining the delay.
- Change its `submit` output from `string` to `{ password: string; delayMinutes: number }`. Update `PasswordComponent.initSetNewPassword()` to call `PasswordService.setPassword(...)`.
- Update the dialog texts to the final design copy (title "Setting password" and so on) only once the copy is confirmed in Figma.

### 6. Locales

- New keys in `_locales/en`, `ru`, `de` (all three, as the project rule says). A list to start from:
  - `password_enter_forgot`, `password_enter_cancel_reset`, `password_enter_reset_tag`
  - `password_reset_in_progress_title`, `password_reset_in_progress_remaining`
  - `password_reset_confirm_title`, `password_reset_confirm_tag`, `password_reset_confirm_intro`, `password_reset_confirm_info_*`, `password_reset_start`, `password_reset_back`
  - `password_set_delay_label`, `password_set_delay_1_hour`, `password_set_delay_4_hours`, `password_set_delay_1_day`, `password_set_delay_info_*`
  - `snackbar_password_reset_done`
- Existing strings that already match the new header pills: "Access is restricted" (`password_enter_tag`) and "Password settings" (`password_set_tag`) are the same labels as pills 4 and 3 of the labels export. Only "Password Reset" and "Access Recovery" are new header labels. Text for the info blocks must come from Figma, because the SVG text is outlined.

### 7. Tests

- Unit: service, time format, `ruckit-pill-group`, `ruckit-info-block`.
- E2E (`e2e/tests/settings/password.spec.ts`, plus a helper in `e2e/support/settings-page.ts`): no fake clock is needed, because the state is plain storage.
  - Set a password and pick 1 hour: storage has the delay.
  - "Forgot password?" then "Go back": nothing changes in storage.
  - "Forgot password?" then "Start reset": `ends-at` is written, the dialog shows the timer and "Cancel reset".
  - "Cancel reset": `ends-at` is removed.
  - Pre-seed `ends-at` in the past, open the page: the password is gone and the toggle is off.
  - Pre-seed `ends-at` in the future, enter the right password: `ends-at` is removed.
  - Existing user (password, no delay): "Start reset" uses 1 day.
- Run the existing `password.spec.ts` and `password-lock.spec.ts` unchanged to confirm nothing regressed. Update `e2e/docs/settings-page.md`.

## Risks and limits

- **Plain-text password in sync storage** (backlog #13) is unchanged by this work, so a reset does not make the lock stronger than before. Anyone who can read the storage can read the password anyway.
- **System clock:** the end time uses the local clock, so moving the clock forward ends a reset early. Accept this for now. The sync storage also means two devices with different clocks may disagree by a little.
- **No background timer:** the password is removed the next time the UI looks at it, not at the exact second. That is fine, because nothing outside the UI reads the password.
- **Copy:** the Figma text is outlined, so every new string needs a final check against Figma before it goes into the locales.

## Open questions

1. Confirm decisions 6 to 9 above (starred).
2. Header pill labels "Quotes Settings", "Blacklist Settings" and "Import & Export Settings" in the labels export: is this a rename of other dialogs too (for example `blacklist_manage_tag`)? The plan leaves them untouched.
3. Should a finished reset show a snackbar, and what should it say?
