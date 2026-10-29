import { BlackListRestrictionType } from 'src/app/settings/layout-content/black-list/black-list.models';
import { BlackListStorage, migrateLegacyPhrasesIntoKeywordsAndPhrases } from './black-list-storage';
import { FakeChrome, flushStorageEvents, installFakeChrome } from './testing/fake-chrome';

// persisted storage keys (see src/app/shared/constants.ts) - this is user data, never rename
const KEYWORDS_AND_PHRASES = 'blk';
const KEYWORDS_AND_PHRASES_ON = 'blkito';
// old phrases list (before phrases were merged into the keywords and phrases list)
const LEGACY_PHRASES = 'blph';
const LEGACY_PHRASES_ON = 'blphito';

describe('BlackListStorage: keywords and phrases', () => {
    let fakeChrome: FakeChrome;

    async function createStorage(stored: Record<string, unknown>): Promise<BlackListStorage> {
        fakeChrome = installFakeChrome(stored);
        const storage = new BlackListStorage();
        await storage.init();

        return storage;
    }

    afterEach(() => fakeChrome?.restore());

    describe('loading', () => {
        it('loads the stored list and its toggle', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats', 'dogs'], [KEYWORDS_AND_PHRASES_ON]: true });

            expect(storage.keywordsAndPhrases).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
            expect(storage.keywordsAndPhrasesIsTurnedOn).toBeTrue();
        });

        it('merges the old phrases list into the keywords and phrases (data saved before the merge)', async () => {
            const storage = await createStorage({
                [KEYWORDS_AND_PHRASES]: ['cats', 'dogs'], [KEYWORDS_AND_PHRASES_ON]: true,
                [LEGACY_PHRASES]: ['bad day', 'How to', 'cats'], [LEGACY_PHRASES_ON]: true,
            });

            expect(storage.keywordsAndPhrases).toEqual(['cats', 'dogs', 'bad day', 'How to']);
        });

        it('turns the merged list on when only the old phrases list was on and had items', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: ['bad day'], [LEGACY_PHRASES_ON]: true });

            expect(storage.keywordsAndPhrasesIsTurnedOn).toBeTrue();
        });

        it('keeps the merged list off when the old phrases list was on but empty', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: [], [LEGACY_PHRASES_ON]: true });

            expect(storage.keywordsAndPhrasesIsTurnedOn).toBeFalse();
        });

        it('treats missing data as an empty, turned off list', async () => {
            const storage = await createStorage({});

            expect(storage.keywordsAndPhrases).toEqual([]);
            expect(storage.keywordsAndPhrasesIsTurnedOn).toBeFalsy();
        });

        it('does not write to storage while loading when there is nothing to change', async () => {
            await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });

            expect(fakeChrome.setCalls).toEqual([]);
        });
    });

    describe('adding', () => {
        it('adds a keyword and persists the whole list', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });

            storage.addBlackListItem('dogs', BlackListRestrictionType.KeywordsAndPhrases);

            expect(storage.keywordsAndPhrases).toContain('dogs');
            expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
        });

        it('adds a multi-word phrase to the list as is', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: [], [KEYWORDS_AND_PHRASES_ON]: true });

            storage.addBlackListItem('How to cook', BlackListRestrictionType.KeywordsAndPhrases);

            expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['How to cook']);
        });

        it('ignores a duplicate keyword', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });

            storage.addBlackListItem('cats', BlackListRestrictionType.KeywordsAndPhrases);

            expect(storage.keywordsAndPhrases.filter(item => item === 'cats').length).toBe(1);
            expect(fakeChrome.setCalls).toEqual([]);
        });

        it('ignores an empty keyword', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });

            storage.addBlackListItem('', BlackListRestrictionType.KeywordsAndPhrases);
            storage.addBlackListItem(undefined, BlackListRestrictionType.KeywordsAndPhrases);

            expect(fakeChrome.setCalls).toEqual([]);
        });
    });

    describe('removing', () => {
        it('removes a keyword by index and persists the list', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats', 'dogs', 'birds'], [KEYWORDS_AND_PHRASES_ON]: true });
            const index = storage.keywordsAndPhrases.indexOf('dogs');

            storage.removeBlackListItem(index, BlackListRestrictionType.KeywordsAndPhrases);

            expect(storage.keywordsAndPhrases).not.toContain('dogs');
            expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).not.toContain('dogs');
            expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(jasmine.arrayContaining(['cats', 'birds']));
        });
    });

    describe('toggle', () => {
        it('persists turning the list on and off', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false });

            storage.setBlackListTutnedOn(true, BlackListRestrictionType.KeywordsAndPhrases);
            expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeTrue();

            storage.setBlackListTutnedOn(false, BlackListRestrictionType.KeywordsAndPhrases);
            expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeFalse();
        });
    });

    describe('change handler', () => {
        it('picks up the list changed in another context (settings page)', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });
            storage.initHandler();

            await chrome.storage.sync.set({ [KEYWORDS_AND_PHRASES]: ['cats', 'dogs'] });
            await flushStorageEvents();

            expect(storage.keywordsAndPhrases).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
        });

        it('picks up the toggle changed in another context', async () => {
            const storage = await createStorage({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: true });
            storage.initHandler();

            await chrome.storage.sync.set({ [KEYWORDS_AND_PHRASES_ON]: false });
            await flushStorageEvents();

            expect(storage.keywordsAndPhrasesIsTurnedOn).toBeFalse();
        });
    });
});

/* One-time migration of the old phrases list into the keywords list (runs when the background script starts). */
describe('migrateLegacyPhrasesIntoKeywordsAndPhrases', () => {
    let fakeChrome: FakeChrome;

    afterEach(() => fakeChrome?.restore());

    it('merges both lists without duplicates, turns the list on and removes the old keys', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['hate', 'War'], [KEYWORDS_AND_PHRASES_ON]: true, [LEGACY_PHRASES]: ['Bad Day', 'hate'], [LEGACY_PHRASES_ON]: true });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['hate', 'War', 'Bad Day']);
        expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeTrue();
        expect(LEGACY_PHRASES in fakeChrome.store).toBeFalse();
        expect(LEGACY_PHRASES_ON in fakeChrome.store).toBeFalse();
    });

    it('turns the list on when only the old phrases list was on and had items', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['a'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: ['some phrase'], [LEGACY_PHRASES_ON]: true });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['a', 'some phrase']);
        expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeTrue();
    });

    it('keeps the list on when it was on and the old phrases list was off', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['a'], [KEYWORDS_AND_PHRASES_ON]: true, [LEGACY_PHRASES]: ['p'], [LEGACY_PHRASES_ON]: false });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['a', 'p']);
        expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeTrue();
    });

    it('does not turn the list on because of an empty old phrases list', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['a'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: [], [LEGACY_PHRASES_ON]: true });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['a']);
        expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeFalse();
    });

    it('creates the keywords and phrases list when only the old phrases list existed', async () => {
        fakeChrome = installFakeChrome({ [LEGACY_PHRASES]: ['x y'], [LEGACY_PHRASES_ON]: true });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.store[KEYWORDS_AND_PHRASES]).toEqual(['x y']);
        expect(fakeChrome.store[KEYWORDS_AND_PHRASES_ON]).toBeTrue();
    });

    it('writes nothing when there is no old phrases data (new users, already migrated)', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['a'], [KEYWORDS_AND_PHRASES_ON]: true });

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();
        await migrateLegacyPhrasesIntoKeywordsAndPhrases();

        expect(fakeChrome.setCalls).toEqual([]);
    });

    it('updates an open YouTube page (content script) with the merged list', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS_AND_PHRASES]: ['cats'], [KEYWORDS_AND_PHRASES_ON]: false, [LEGACY_PHRASES]: ['bad day'], [LEGACY_PHRASES_ON]: true });
        const storage = new BlackListStorage();
        await storage.init();
        storage.initHandler();

        await migrateLegacyPhrasesIntoKeywordsAndPhrases();
        await flushStorageEvents();

        expect(storage.keywordsAndPhrases).toEqual(['cats', 'bad day']);
        expect(storage.keywordsAndPhrasesIsTurnedOn).toBeTrue();
    });
});
