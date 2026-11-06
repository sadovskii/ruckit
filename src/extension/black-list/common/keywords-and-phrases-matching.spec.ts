import { matchesKeywordOrPhrase, mergeUniqueKeywordsAndPhrases } from './keywords-and-phrases-matching';

/* The single matching rule for the "keywords and phrases" list: the title contains the item as whole words, ignoring case. */
describe('matchesKeywordOrPhrase', () => {
    const cases: [string, string | null | undefined, string[], boolean][] = [
        ['a word of the title', 'Funny cats compilation', ['cats'], true],
        ['a word at the start of the title', 'wo I use this for connect with my gf', ['wo'], true],
        ['a word at the end of the title', 'This is what I use: wo', ['wo'], true],
        ['not the start of a longer word', 'world is good', ['wo'], false],
        ['not the middle of a longer word', 'Whatever happens', ['hate'], false],
        ['not the end of a longer word', 'Two cats', ['wo'], false],
        ['not a singular inside a plural', 'Funny cats', ['cat'], false],
        ['a word in different case', 'FUNNY CATS', ['cats'], true],
        ['a cyrillic word in different case', 'Смешные КОШКИ', ['кошки'], true],
        ['not part of a longer cyrillic word', 'Смешные кошками', ['кошки'], false],
        ['next to punctuation', 'I love cats!', ['cats'], true],
        ['inside quotes and brackets', 'The "cats" (part 2)', ['cats'], true],
        ['next to an emoji', 'cats😺 and dogs', ['cats'], true],
        ['after a hashtag sign', 'Daily #cats video', ['cats'], true],
        ['a number as a whole number', 'Best of 2024', ['2024'], true],
        ['not part of a longer number', 'Code 20245', ['2024'], false],
        ['not glued to a number', 'cats2 compilation', ['cats'], false],
        ['an item ending with symbols', 'Learn C++ fast', ['C++'], true],
        ['an item starting with a symbol', 'Daily #news today', ['#news'], true],
        ['not a symbol item inside a longer word', 'Join the #newsletter', ['#news'], false],
        ['an emoji item inside a word', 'cute😺cats', ['😺'], true],
        ['a word before an apostrophe', "Don't do this", ['don'], true],
        ['a phrase', 'Today breaking news live', ['breaking news'], true],
        ['a phrase in different case', 'how to cook pasta', ['How To Cook'], true],
        ['a phrase in different case (cyrillic)', 'КАК приготовить пасту', ['как ПРИГОТОВИТЬ'], true],
        ['a phrase found after a partial match earlier in the title', 'world of wo I use', ['wo I'], true],
        ['not a phrase that starts inside a word', 'breaking news', ['king news'], false],
        ['not a phrase that ends inside a word', 'Best cat videos', ['cat video'], false],
        ['words of a phrase in another order', 'Today breaking news', ['news breaking'], false],
        ['nothing matches', 'Cats', ['dog', 'bad day'], false],
        ['an empty item is ignored', 'Cats', [''], false],
        ['an empty list', 'Cats', [], false],
        ['no text', undefined, ['a'], false],
        ['empty text', '', ['a'], false],
    ];

    for (const [description, text, keywordsAndPhrases, expected] of cases) {
        it(`${expected ? 'matches' : 'does not match'}: ${description}`, () => {
            expect(matchesKeywordOrPhrase(text, keywordsAndPhrases)).toBe(expected);
        });
    }
});

describe('mergeUniqueKeywordsAndPhrases', () => {
    it('keeps the order, drops duplicates, empty items and missing lists', () => {
        expect(mergeUniqueKeywordsAndPhrases(['a', 'b'], undefined, ['b', '', 'c'], null, ['a'])).toEqual(['a', 'b', 'c']);
    });

    it('treats different letter case as different items', () => {
        expect(mergeUniqueKeywordsAndPhrases(['Cats'], ['cats'])).toEqual(['Cats', 'cats']);
    });
});
