# Ruckit Angular Application Analysis

## Key Files Explored
- App Module: [src/app/app.module.ts](src/app/app.module.ts#L1)
- App Component: [src/app/app.component.ts](src/app/app.component.ts#L1)
- Popup Component: [src/app/popup/popup.component.ts](src/app/popup/popup.component.ts#L1)
- Settings Component: [src/app/settings/settings.component.ts](src/app/settings/settings.component.ts#L1)
- Global Service: [src/app/shared/services/global/global.service.ts](src/app/shared/services/global/global.service.ts#L1)
- Chrome Service: [src/app/shared/services/chrome/chrome.service.ts](src/app/shared/services/chrome/chrome.service.ts#L1)
- BlackList Component: [src/app/settings/layout-content/black-list/black-list.component.ts](src/app/settings/layout-content/black-list/black-list.component.ts#L1)
- HideList Component: [src/app/settings/layout-content/hide-list/hide-list.component.ts](src/app/settings/layout-content/hide-list/hide-list.component.ts#L1)

## Architecture Overview
- Single module application (AppModule)
- Two main UI contexts: Popup (compact) and Settings (full page)
- Restricted/Password protection system
- Data flows through services to components
- Heavy use of RxJS observables
- Nebular UI component library
- Chrome extension integration

## State Management
- GlobalService: Manages password/restriction state with BehaviorSubjects
- ChromeService: Wrapper for Chrome APIs (storage, tabs, scripting)
- Component-level services: BlackListStorageService, RuckitSnackBarService

## Data Flow
- App detects popup vs settings page
- Components subscribe to storage changes
- Dialog-based management for restrictions
- Cascading updates to Chrome extension scripts

## Test Coverage
- Basic skeleton tests only (create, title, render)
- No service logic tests
- No component interaction tests
- No integration tests
