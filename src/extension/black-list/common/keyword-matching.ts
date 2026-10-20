/**
 * Case-insensitive substring match of any keyword (a word or a phrase) against the text.
 * This is a superset of the former rules (keywords: substring of a single word, case-insensitive;
 * phrases: case-sensitive substring of the title), so nothing hidden before becomes visible.
 */
export function matchesBlackListKeyword(text: string | null | undefined, keywords: string[]): boolean {
    if (!text || !keywords?.length) return false;

    const lowerText = text.toLocaleLowerCase();

    return keywords.some(keyword => !!keyword && lowerText.includes(keyword.toLocaleLowerCase()));
}

export function mergeUniqueKeywords(...lists: (string[] | null | undefined)[]): string[] {
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
