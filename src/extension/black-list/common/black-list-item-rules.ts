/*
 * What a user can save as a black-list item (a keyword or a phrase).
 * An item made only of spaces and symbols (" ", ".", ":", "...", "!?", "-") would match almost every title,
 * so an item must contain at least one letter (any alphabet), digit or emoji.
 */

const LETTER_DIGIT_OR_EMOJI = /[\p{L}\p{N}\p{Extended_Pictographic}]/u;

/** The form in which an item is saved: without spaces around it (" cats " is saved as "cats"). */
export function normalizeBlackListItem(item: string): string {
    return item.trim();
}

export function containsLetterDigitOrEmoji(item: string): boolean {
    return LETTER_DIGIT_OR_EMOJI.test(item);
}
