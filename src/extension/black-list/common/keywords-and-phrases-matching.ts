/**
 * True when the text contains any of the items (a word or a phrase), ignoring case.
 * This is a superset of the rules before the merge (keywords: substring of a single word, case-insensitive;
 * phrases: case-sensitive substring of the title), so nothing hidden before becomes visible.
 */
export function matchesKeywordOrPhrase(text: string | null | undefined, keywordsAndPhrases: string[]): boolean {
    if (!text || !keywordsAndPhrases?.length) return false;

    const lowerText = text.toLocaleLowerCase();

    return keywordsAndPhrases.some(item => !!item && lowerText.includes(item.toLocaleLowerCase()));
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
