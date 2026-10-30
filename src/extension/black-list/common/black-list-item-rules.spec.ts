import { containsLetterDigitOrEmoji, normalizeBlackListItem } from './black-list-item-rules';

describe('black-list item rules', () => {
    describe('containsLetterDigitOrEmoji', () => {
        const rejected = [' ', '   ', '\u00a0', '\t', '\u200b', '.', ':', '...', ' : ', ',;', '!?', '-', '—', '…', '«»', '()', '#', '*/', '"', '~', '¿'];
        const accepted = ['cats', 'кошки', 'cats!', 'C++', '1:0', '2024', 'Mr. Bean', '😺', '👍🏽', '#news'];

        for (const item of rejected) {
            it(`rejects "${item}"`, () => expect(containsLetterDigitOrEmoji(item)).toBe(false));
        }

        for (const item of accepted) {
            it(`accepts "${item}"`, () => expect(containsLetterDigitOrEmoji(item)).toBe(true));
        }
    });

    describe('normalizeBlackListItem', () => {
        it('removes spaces around the item', () => expect(normalizeBlackListItem('  How to cook \u00a0')).toBe('How to cook'));

        it('keeps spaces inside a phrase', () => expect(normalizeBlackListItem('How  to cook')).toBe('How  to cook'));
    });
});
