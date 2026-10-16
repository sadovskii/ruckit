type Substitutions = string | number | (string | number)[];

/**
 * Returns a localized string from `_locales/<locale>/messages.json`.
 * Falls back to the key when the message is missing or `chrome.i18n` is unavailable (e.g. `ng serve`, Karma).
 * Works in extension pages and content scripts.
 */
export function t(key: string, substitutions?: Substitutions): string {
  const subs = substitutions === undefined
    ? undefined
    : (Array.isArray(substitutions) ? substitutions : [substitutions]).map(String);

  if (typeof chrome === 'undefined' || !chrome.i18n) {
    return key;
  }

  return chrome.i18n.getMessage(key, subs) || key;
}
