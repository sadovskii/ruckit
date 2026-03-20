## Plan: Ruckit Extension Architecture Analysis

This plan summarizes the codebase analysis and defines a practical roadmap to improve reliability, maintainability, and testability across both Angular UI and extension runtime. The approach prioritizes high-risk runtime issues first, then architecture hardening, then coverage.

**Steps**
1. Phase 1 - Runtime Reliability (highest priority)
2. Fix heartbeat lifecycle in [src/extension/black-list/black-list-heartbeat.ts](src/extension/black-list/black-list-heartbeat.ts) to avoid interval/timeout leaks and ensure cleanup on navigation/unload.
3. Harden message handling in [src/extension/background.ts](src/extension/background.ts) for unknown payloads and explicit success/error responses.
4. Close storage init/listener race in [src/extension/black-list/black-list-storage.ts](src/extension/black-list/black-list-storage.ts) and heartbeat startup sequence (depends on step 2).
5. Stabilize page handlers by centralizing selectors used by [src/extension/black-list/pages/video-page/video-page.ts](src/extension/black-list/pages/video-page/video-page.ts), [src/extension/black-list/search-page/search-page.ts](src/extension/black-list/search-page/search-page.ts), and related redirect handlers (parallel with step 4).
6. Phase 2 - Angular Maintainability
7. Split monolithic declarations in [src/app/app.module.ts](src/app/app.module.ts) into feature modules for popup/settings/shared/core (depends on phase 1).
8. Standardize subscription teardown and state flows in [src/app/settings/layout-content/black-list/black-list.component.ts](src/app/settings/layout-content/black-list/black-list.component.ts), [src/app/settings/layout-content/password/password.component.ts](src/app/settings/layout-content/password/password.component.ts), and [src/app/shared/services/global/global.service.ts](src/app/shared/services/global/global.service.ts).
9. Decouple UI storage service inheritance in [src/app/settings/layout-content/black-list/black-list-storage.service.ts](src/app/settings/layout-content/black-list/black-list-storage.service.ts) from extension runtime models (depends on step 8).
10. Phase 3 - Test Coverage and Regression Safety
11. Add unit tests for URL classification in [src/extension/url-detector.ts](src/extension/url-detector.ts), storage behavior in [src/extension/black-list/black-list-storage.ts](src/extension/black-list/black-list-storage.ts), and Chrome API wrappers in [src/app/shared/services/chrome/chrome.service.ts](src/app/shared/services/chrome/chrome.service.ts).
12. Add integration-style tests for blacklist and hidelist flows across [src/app/settings/layout-content/black-list/black-list.component.ts](src/app/settings/layout-content/black-list/black-list.component.ts), [src/app/settings/layout-content/hide-list/hide-list.component.ts](src/app/settings/layout-content/hide-list/hide-list.component.ts), and [src/extension/background.ts](src/extension/background.ts).
13. Add smoke checks for restricted-page redirect and CSS injection sequencing from [src/extension/background-functionality.ts](src/extension/background-functionality.ts) (depends on step 11).

**Relevant files**
- [src/extension/background.ts](src/extension/background.ts) - extension event lifecycle, navigation hooks, message routing
- [src/extension/background-functionality.ts](src/extension/background-functionality.ts) - CSS injection sequencing and tab application
- [src/extension/url-detector.ts](src/extension/url-detector.ts) - page-type detection contract used by heartbeat
- [src/extension/black-list/black-list-heartbeat.ts](src/extension/black-list/black-list-heartbeat.ts) - runtime polling/dispatch loop
- [src/extension/black-list/black-list-storage.ts](src/extension/black-list/black-list-storage.ts) - persisted blacklist model and onChanged updates
- [src/extension/black-list/pages/video-page/video-page.ts](src/extension/black-list/pages/video-page/video-page.ts) - watch-page enforcement and UI injection
- [src/extension/black-list/search-page/search-page.ts](src/extension/black-list/search-page/search-page.ts) - search-page enforcement and mutation observer usage
- [src/app/app.module.ts](src/app/app.module.ts) - Angular composition and declaration scope
- [src/app/shared/services/global/global.service.ts](src/app/shared/services/global/global.service.ts) - restriction/password session behavior
- [src/app/shared/services/chrome/chrome.service.ts](src/app/shared/services/chrome/chrome.service.ts) - Chrome API abstraction in UI
- [src/app/settings/layout-content/black-list/black-list.component.ts](src/app/settings/layout-content/black-list/black-list.component.ts) - settings UX and change propagation
- [src/app/settings/layout-content/hide-list/hide-list.component.ts](src/app/settings/layout-content/hide-list/hide-list.component.ts) - CSS toggle UX and storage sync
- [src/app/settings/layout-content/black-list/black-list-storage.service.ts](src/app/settings/layout-content/black-list/black-list-storage.service.ts) - UI/runtime storage coupling point

**Verification**
1. Run project tests and ensure no regressions in Angular specs and extension logic-oriented specs.
2. Manual flow: popup -> open settings -> add/remove blacklist item -> verify immediate effect on YouTube tab.
3. Manual flow: toggle multiple hidelist options -> reload/navigate YouTube -> confirm CSS presence and absence correctly.
4. Manual flow: trigger restricted-page redirect from watch/search/channel contexts and verify block rendering consistency.
5. Validate that listeners/timers are cleaned up by observing no duplicate actions after reloads/navigation.

**Decisions**
- Included scope: architecture and risk analysis for both [src/app](src/app) and [src/extension](src/extension), plus prioritized remediation plan.
- Excluded scope: major feature redesigns, visual UI redesign, and analytics/telemetry additions.
- Priority rationale: runtime correctness before module organization, module organization before broad test expansion.

**Further Considerations**
1. Password storage hardening recommendation: use hashed/salted value instead of plaintext in sync storage.
2. Selector durability strategy: maintain fallback selectors for YouTube DOM churn and keep selector constants centralized.
3. Event strategy: consider moving more runtime behavior to webNavigation-driven hooks where practical.

## Addendum: Markdown Archive Request

Goal: persist all Markdown docs into a root-level ai folder for future reference.

Planned archive targets:
- Workspace Markdown: [README.md](README.md)
- Session analysis doc: /memories/session/ruckit_angular_analysis.md
- Session plan doc: /memories/session/plan.md

Proposed destination layout:
- ai/docs/README.md
- ai/docs/ruckit_angular_analysis.md
- ai/docs/plan.md

PowerShell command sequence (from repo root):
1. New-Item -ItemType Directory -Force -Path ai/docs | Out-Null
2. Copy-Item README.md ai/docs/README.md -Force
3. Copy-Item "$env:USERPROFILE\AppData\Roaming\Code\User\workspaceStorage\*\GitHub.copilot-chat\chat-session-resources\*\*\content.txt" ai/docs/ -ErrorAction SilentlyContinue

Note: session-memory files are not stored in the repo workspace directly; they must be copied from memory into workspace files by a write-capable implementation agent or pasted manually.
