# Forgot password / password reset — task notes (not started)

Status: **design saved for later, nothing implemented.**

## Task (from the owner)

- The "enter password" screen must be updated.
- Add a **Forgot password** button.
- Add a **reset in progress** state (a password reset is pending and can be cancelled).

## Where the code lives today

- `src/app/settings/layout-content/password/` — `enter-password`, `change-password`, `set-new-password`, `password.service.ts`
- `src/app/shared/components/ruckit-password-input/` — shared password field
- `src/app/shared/components/ruckit-dialog/` — shared dialog
- `src/app/shared/services/global/global.service.ts` — password session behaviour
- E2E: `e2e/tests/settings/password.spec.ts`, `e2e/tests/settings/password-lock.spec.ts`
- Known issue relevant to this work: password is stored in plaintext in `chrome.storage.sync` (see `backlog.md`, #13).

## Design (Figma export, 1164x790 frame, dashed purple border)

Four dialog cards in a 2x2 grid. Left column is the **dark theme**, right column is the **light theme**. Top row is the normal state, bottom row is the reset-in-progress state.

Common structure of each card (top to bottom):

1. Header pill: red Ruckit logo mark + label (dark `#151515`, light `#F2F2F2`).
2. Close "X" button at the top right.
3. Large title "Enter password".
4. Thin divider under the title.
5. Password input: placeholder "Enter password", eye icon on the right.
6. Primary button below the input (dark `#1C1C1C`, light `#E6E6E6`), label starts with "Co..." (likely "Confirm").

Differences between the two rows:

- **Top row (normal):** below the button, a small grey centred link, "Forgot password?". The card is shorter (322 px tall).
- **Bottom row (reset in progress):** an extra info block (72 px tall, same fill as the input) sits between the input and the button area. It has a red clock icon, a "Reset in progress" style heading and a smaller time/progress line. Below the button the link is "Cancel reset" instead of "Forgot password?". The card is taller (408 px).

I could not reliably decode the exact copy of the info block's second line, the header label, or the button label, because the export has the text converted to outlines. Confirm the final copy against Figma.

Colours:

| Role | Dark | Light |
|------|------|-------|
| Card | `#0F0F0F` | `#FEFEFE` |
| Header pill / input / info block | `#151515` | `#F2F2F2` |
| Button | `#1C1C1C` | `#E6E6E6` |
| Title and text | `#FEFEFE` | `#0F0F0F` |
| Placeholder, icons, link | `#4D4D4D` | `#9C9C9C` |
| Divider | `#272727` | `#CECECE` |
| Accent (logo, clock) | `#F0331B` | `#F0331B` |

Sizes: card width 552, inner content width 480 (28 px side padding), card radius 24, field radius 12, field height 44.

## Design: reset confirmation screen (second Figma export, 1164x466 frame)

Shown after the user taps "Forgot password?". Two cards side by side, dark (left) and light (right), same palette and sizes as above. The card is 552 x 426.

From top to bottom:

1. Header pill with a red padlock icon and the label "Password Reset" (see the labels section).
2. Close "X" at the top right.
3. Large title: "Reset password?".
4. Divider.
5. A short intro paragraph (two lines, white text on dark, black on light). One phrase near the end is underlined, so it is probably a link or an emphasised term.
6. Info box (480 x 90, same fill as the input field `#151515` / `#F2F2F2`): red clock icon, a bold-looking first line (a time or delay statement), then two smaller grey lines of explanation.
7. Primary button (dark `#1C1C1C`, light `#E6E6E6`), label reads "Start reset".
8. Secondary outlined button below it (0.5 px border, no fill, `#272727` on dark and `#E6E6E6` on light), label reads "Go back".

How it fits the flow: "Forgot password?" opens this screen, "Start reset" begins the pending reset (the "Reset in progress" card with "Cancel reset" from the first design), and "Go back" returns to "Enter password". The clock icon here matches the clock in the "Reset in progress" block, which suggests the reset is time-delayed.

As before, the exact wording of the intro paragraph, the info box lines and the header label is not recoverable from the outlined paths. Take the final copy from Figma.

## Design: updated "Setting password" screen (third Figma export, 1164x592 frame)

This is the updated screen for setting a password (the existing `set-new-password` / `change-password` flow), again as a dark card (left) and a light card (right), 552 x 552. It has the same palette as above. From top to bottom:

1. Header pill: red "password dots" icon + label "Password Settings" (see the labels section).
2. Close "X" at the top right.
3. Large title: "Setting password".
4. Divider.
5. Small label above the first field, starting with a red-style asterisk mark (required-field hint). Exact wording not decoded.
6. Field 1: placeholder "Enter new password", eye-off icon on the right.
7. Field 2: placeholder "Confirm password", eye-off icon on the right.
8. Short helper label (one line), then a row of **three option pills** (each 32 px tall, radio icon + text):
   - Design shows "1 day", "3 days" (**selected**: red `#F0331B` fill, filled radio, white text), "7 days".
   - **Decided later by the owner: the options are "1 hour", "4 hours", "1 day"** (see the plan). The middle one is selected by default.
   Unselected pills use `#1C1C1C` (dark) or `#E6E6E6` (light) with an outlined radio.
9. Info box (480 x 90, field fill): red shield icon (see the icons section: shield with an exclamation mark), a heading line and two smaller grey lines. Exact wording not decoded.
10. Primary button at the bottom (`#1C1C1C` dark / `#E6E6E6` light). The label looks like "Set password" (not certain).

How the pieces seem to fit together (an inference, not stated in the design): the pills choose the delay used by the password reset described above, and the info box explains that delay. The owner confirmed this and set the options to 1 hour, 4 hours and 1 day.

As with the other exports, the text is outlined, so the helper label, the info box copy and the button label should be taken from Figma.

## Design: new header pill labels (fourth Figma export, 1389x124 frame)

A strip of seven header pills (the pill at the top-left of each card), each in a dark version (`#151515`, white text) and a light version (`#F2F2F2`, dark text). Each has a red icon on the left. The text was outlined, so the labels below were read from the letter shapes; they are very likely right, but check them against Figma.

| # | Label | Icon (red) | Likely screen |
|---|-------|-----------|---------------|
| 1 | Access Recovery | key | probably the reset-in-progress state of the Enter password dialog. Inference. |
| 2 | Import & Export Settings | document | existing import/export page |
| 3 | Password Settings | password dots in a rounded box | "Setting password" (design 3), matches the existing `password_set_tag` |
| 4 | Access is Restricted | diagonal tag | Enter password dialog (matches the existing `password_enter_tag`). |
| 5 | Quotes Settings | speech bubble with bars | existing quotes settings |
| 6 | Blacklist Settings | list with an X | existing blacklist settings |
| 7 | Password Reset | padlock | "Reset password?" confirmation (design 2) |

Notes:

- Pills 3 and 7 match the icons in designs 3 and 2 (password dots and padlock), which is how those two were mapped.
- Pill 1 is only a guess for design 1 (the icon matches the logo-style mark there). Pill 4 may be the blocked page header, which was recently restyled (`match blocked page theme to YouTube theme`).
- Pills 2, 5 and 6 look like labels for existing pages, so this may be a rename of all header labels, not only the password ones. Check which pages get a new label.
- Every label is new copy, so each needs an entry in `_locales/en`, `ru` and `de`.

## Design: new icons (fifth Figma export, 756x226 frame)

Five groups of icons, all exported in white `#FEFEFE` on the dark theme. In the screens they are tinted (red `#F0331B` in header pills and info boxes, grey in inputs). Icon names below are my reading of the shapes.

**Status icons (about 20 px):**

- Alert: rounded square with an exclamation mark inside.
- Success: filled circle with a check mark.
- Badge: hexagon with a star, with a small band above it (the band looks like a ribbon or a crown base). Purpose unclear; it may mark a premium or "pro" state. Confirm.

**Small glyphs (white characters in 51 px frames):** a question mark "?" and an exclamation mark "!". Probably help and warning marks used as plain text characters. Confirm where they are used.

**Theme icons (16 px, outline and filled versions):**

- Sun (outline with rays, and a filled version).
- Moon (outline, and a filled version).
- Monitor (outline, and a filled version) for the system theme.

The outline and filled pairs are most likely the unselected and selected states of a theme switch (light / dark / system).

**Header pill icons (16 px):** key, document, password dots, tag, speech bubble with bars, receipt with an X. They match pills 1 to 6 in the labels table above. The padlock for "Password Reset" is not in this strip (it is in the earlier export). A second copy of the receipt icon sits outside the frames, probably a leftover.

**Info box icons (new):**

- Shield with an exclamation mark. This is probably the info box icon of the "Setting password" screen, replacing the shield-and-lock I described there.
- Clock (filled circle with hands). Matches the red clock in the "Reset in progress" block and the confirmation screen.

Implementation note: the repo has no icon files for these. When the work starts, export each icon as SVG from Figma and check how the existing icons are added (see `src/app/shared/`).

## Open questions before implementing

- What does "reset" do? E.g. no email exists in the extension, so a likely model is a delayed reset (wait N days, then the password is cleared), cancellable during the wait. The delay is chosen when the password is set (1 hour, 4 hours or 1 day). Decisions on where the times are stored are in [forgot-password-reset-plan.md](forgot-password-reset-plan.md).
- Should the reset survive closing the popup/settings page (needs storage), and what happens when the delay ends?
- New strings needed in `_locales/en`, `ru` and `de`.
- The original SVG export is not stored in the repo; re-export from Figma when work starts.
