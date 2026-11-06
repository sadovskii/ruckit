/*
 * An item (a word or a phrase) hides a title only when the title contains it as whole words, ignoring case:
 * "wo" matches "wo I use this" but not "world is good"; "cat video" matches "Best cat video!" but not "cat videos".
 * A word ends where a letter or digit is followed by anything else (space, punctuation, emoji, the end of the title).
 * Boundaries are only required at an item's letter/digit edges, so "C++", "#news" and "😺" still work.
 */

const WORD_CHARACTER = /[\p{L}\p{N}\p{M}]/u;

export function matchesKeywordOrPhrase(text: string | null | undefined, keywordsAndPhrases: string[]): boolean {
    if (!text || !keywordsAndPhrases?.length) return false;

    const lowerText = text.toLocaleLowerCase();

    return keywordsAndPhrases.some(item => !!item && containsAsWholeWords(lowerText, item.toLocaleLowerCase()));
}

function containsAsWholeWords(text: string, item: string): boolean {
    const itemCharacters = [...item];
    const itemStartsWithWordCharacter = isWordCharacter(itemCharacters[0]);
    const itemEndsWithWordCharacter = isWordCharacter(itemCharacters[itemCharacters.length - 1]);

    for (let index = text.indexOf(item); index !== -1; index = text.indexOf(item, index + 1)) {
        const startsAtWordStart = !itemStartsWithWordCharacter || !isWordCharacter(characterBefore(text, index));
        const endsAtWordEnd = !itemEndsWithWordCharacter || !isWordCharacter(characterAt(text, index + item.length));

        if (startsAtWordStart && endsAtWordEnd) return true;
    }

    return false;
}

function isWordCharacter(character: string | undefined): boolean {
    return !!character && WORD_CHARACTER.test(character);
}

/** The whole character (emoji and rare letters take two UTF-16 units) that ends right before `index`. */
function characterBefore(text: string, index: number): string | undefined {
    if (index === 0) return undefined;

    const isSecondHalfOfPair = index >= 2 && /[\uDC00-\uDFFF]/.test(text[index - 1]);

    return text.slice(isSecondHalfOfPair ? index - 2 : index - 1, index);
}

function characterAt(text: string, index: number): string | undefined {
    const codePoint = text.codePointAt(index);

    return codePoint === undefined ? undefined : String.fromCodePoint(codePoint);
}

export function mergeUniqueKeywordsAndPhrases(...lists: (string[] | null | undefined)[]): string[] {
    const result: string[] = [];

    lists.forEach(list => {
        if (!Array.isArray(list)) return;

        list.forEach(item => {
            if (item && !result.includes(item)) {
                result.push(item);
            }
        });
    });

    return result;
}
