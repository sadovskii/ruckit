import { matchesBlackListKeyword, mergeUniqueKeywords } from './keyword-matching';

/* The single matching rule for the "keywords and phrases" list: case-insensitive substring of the title. */
describe('matchesBlackListKeyword', () => {
    const cases: [string, string | null | undefined, string[], boolean][] = [
        ['a word of the title', 'Funny cats compilation', ['cats'], true],
        ['part of a longer word', 'Whatever happens', ['hate'], true],
        ['a phrase', 'Today breaking news live', ['breaking news'], true],
        ['a phrase in different case', 'how to cook pasta', ['How To Cook'], true],
        ['a phrase in different case (cyrillic)', 'КАК приготовить пасту', ['как ПРИГОТОВИТЬ'], true],
        ['a keyword with a space', 'Best cat video ever', ['cat video'], true],
        ['next to punctuation and emoji', 'I love cats!😺', ['cats'], true],
        ['words of a phrase in another order', 'Today breaking news', ['news breaking'], false],
        ['nothing matches', 'Cats', ['dog', 'bad day'], false],
        ['an empty item is ignored', 'Cats', [''], false],
        ['an empty list', 'Cats', [], false],
        ['no text', undefined, ['a'], false],
        ['empty text', '', ['a'], false],
    ];

    for (const [description, text, keywords, expected] of cases) {
        it(`${expected ? 'matches' : 'does not match'}: ${description}`, () => {
            expect(matchesBlackListKeyword(text, keywords)).toBe(expected);
        });
    }
});

describe('mergeUniqueKeywords', () => {
    it('keeps the order, drops duplicates, empty items and missing lists', () => {
        expect(mergeUniqueKeywords(['a', 'b'], undefined, ['b', '', 'c'], null, ['a'])).toEqual(['a', 'b', 'c']);
    });

    it('treats different letter case as different items', () => {
        expect(mergeUniqueKeywords(['Cats'], ['cats'])).toEqual(['Cats', 'cats']);
    });
});
