import { BlackListRestrictionType } from 'src/app/settings/layout-content/black-list/black-list.models';
import { BlackListStorage, migrateLegacyPhrasesToKeywords } from './black-list-storage';
import { FakeChrome, flushStorageEvents, installFakeChrome } from './testing/fake-chrome';

// persisted storage keys (see src/app/shared/constants.ts) - this is user data, never rename
const KEYWORDS = 'blk';
const KEYWORDS_ON = 'blkito';
// old phrases list (before phrases were merged into keywords)
const PHRASES = 'blph';
const PHRASES_ON = 'blphito';

describe('BlackListStorage: keywords', () => {
    let fakeChrome: FakeChrome;

    async function createStorage(stored: Record<string, unknown>): Promise<BlackListStorage> {
        fakeChrome = installFakeChrome(stored);
        const storage = new BlackListStorage();
        await storage.init();

        return storage;
    }

    afterEach(() => fakeChrome?.restore());

    describe('loading', () => {
        it('loads stored keywords and their toggle', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats', 'dogs'], [KEYWORDS_ON]: true });

            expect(storage.keywords).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
            expect(storage.keywordsIsTurnedOn).toBeTrue();
        });

        it('merges the old phrases list into the keywords (data saved before the merge)', async () => {
            const storage = await createStorage({
                [KEYWORDS]: ['cats', 'dogs'], [KEYWORDS_ON]: true,
                [PHRASES]: ['bad day', 'How to', 'cats'], [PHRASES_ON]: true,
            });

            expect(storage.keywords).toEqual(['cats', 'dogs', 'bad day', 'How to']);
        });

        it('turns the merged list on when only the old phrases list was on and had items', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false, [PHRASES]: ['bad day'], [PHRASES_ON]: true });

            expect(storage.keywordsIsTurnedOn).toBeTrue();
        });

        it('keeps the merged list off when the old phrases list was on but empty', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false, [PHRASES]: [], [PHRASES_ON]: true });

            expect(storage.keywordsIsTurnedOn).toBeFalse();
        });

        it('treats missing data as an empty, turned off list', async () => {
            const storage = await createStorage({});

            expect(storage.keywords).toEqual([]);
            expect(storage.keywordsIsTurnedOn).toBeFalsy();
        });

        it('does not write to storage while loading when there is nothing to change', async () => {
            await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });

            expect(fakeChrome.setCalls).toEqual([]);
        });
    });

    describe('adding', () => {
        it('adds a keyword and persists the whole list', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });

            storage.addBlackListItem('dogs', BlackListRestrictionType.Keywords);

            expect(storage.keywords).toContain('dogs');
            expect(fakeChrome.store[KEYWORDS]).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
        });

        it('adds a multi-word phrase to keywords as is', async () => {
            const storage = await createStorage({ [KEYWORDS]: [], [KEYWORDS_ON]: true });

            storage.addBlackListItem('How to cook', BlackListRestrictionType.Keywords);

            expect(fakeChrome.store[KEYWORDS]).toEqual(['How to cook']);
        });

        it('ignores a duplicate keyword', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });

            storage.addBlackListItem('cats', BlackListRestrictionType.Keywords);

            expect(storage.keywords.filter(item => item === 'cats').length).toBe(1);
            expect(fakeChrome.setCalls).toEqual([]);
        });

        it('ignores an empty keyword', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });

            storage.addBlackListItem('', BlackListRestrictionType.Keywords);
            storage.addBlackListItem(undefined, BlackListRestrictionType.Keywords);

            expect(fakeChrome.setCalls).toEqual([]);
        });
    });

    describe('removing', () => {
        it('removes a keyword by index and persists the list', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats', 'dogs', 'birds'], [KEYWORDS_ON]: true });
            const index = storage.keywords.indexOf('dogs');

            storage.removeBlackListItem(index, BlackListRestrictionType.Keywords);

            expect(storage.keywords).not.toContain('dogs');
            expect(fakeChrome.store[KEYWORDS]).not.toContain('dogs');
            expect(fakeChrome.store[KEYWORDS]).toEqual(jasmine.arrayContaining(['cats', 'birds']));
        });
    });

    describe('toggle', () => {
        it('persists turning keywords on and off', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false });

            storage.setBlackListTutnedOn(true, BlackListRestrictionType.Keywords);
            expect(fakeChrome.store[KEYWORDS_ON]).toBeTrue();

            storage.setBlackListTutnedOn(false, BlackListRestrictionType.Keywords);
            expect(fakeChrome.store[KEYWORDS_ON]).toBeFalse();
        });
    });

    describe('change handler', () => {
        it('picks up keywords changed in another context (settings page)', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });
            storage.initHandler();

            await chrome.storage.sync.set({ [KEYWORDS]: ['cats', 'dogs'] });
            await flushStorageEvents();

            expect(storage.keywords).toEqual(jasmine.arrayContaining(['cats', 'dogs']));
        });

        it('picks up the keywords toggle changed in another context', async () => {
            const storage = await createStorage({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: true });
            storage.initHandler();

            await chrome.storage.sync.set({ [KEYWORDS_ON]: false });
            await flushStorageEvents();

            expect(storage.keywordsIsTurnedOn).toBeFalse();
        });
    });
});

/* One-time migration of the old phrases list into the keywords list (runs when the background script starts). */
describe('migrateLegacyPhrasesToKeywords', () => {
    let fakeChrome: FakeChrome;

    afterEach(() => fakeChrome?.restore());

    it('merges both lists without duplicates, turns the list on and removes the old keys', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['hate', 'War'], [KEYWORDS_ON]: true, [PHRASES]: ['Bad Day', 'hate'], [PHRASES_ON]: true });

        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.store[KEYWORDS]).toEqual(['hate', 'War', 'Bad Day']);
        expect(fakeChrome.store[KEYWORDS_ON]).toBeTrue();
        expect(PHRASES in fakeChrome.store).toBeFalse();
        expect(PHRASES_ON in fakeChrome.store).toBeFalse();
    });

    it('turns the list on when only the old phrases list was on and had items', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['a'], [KEYWORDS_ON]: false, [PHRASES]: ['some phrase'], [PHRASES_ON]: true });

        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.store[KEYWORDS]).toEqual(['a', 'some phrase']);
        expect(fakeChrome.store[KEYWORDS_ON]).toBeTrue();
    });

    it('keeps the list on when keywords were on and the old phrases list was off', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['a'], [KEYWORDS_ON]: true, [PHRASES]: ['p'], [PHRASES_ON]: false });

        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.store[KEYWORDS]).toEqual(['a', 'p']);
        expect(fakeChrome.store[KEYWORDS_ON]).toBeTrue();
    });

    it('does not turn the list on because of an empty old phrases list', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['a'], [KEYWORDS_ON]: false, [PHRASES]: [], [PHRASES_ON]: true });

        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.store[KEYWORDS]).toEqual(['a']);
        expect(fakeChrome.store[KEYWORDS_ON]).toBeFalse();
    });

    it('creates the keywords list when only the old phrases list existed', async () => {
        fakeChrome = installFakeChrome({ [PHRASES]: ['x y'], [PHRASES_ON]: true });

        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.store[KEYWORDS]).toEqual(['x y']);
        expect(fakeChrome.store[KEYWORDS_ON]).toBeTrue();
    });

    it('writes nothing when there is no old phrases data (new users, already migrated)', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['a'], [KEYWORDS_ON]: true });

        await migrateLegacyPhrasesToKeywords();
        await migrateLegacyPhrasesToKeywords();

        expect(fakeChrome.setCalls).toEqual([]);
    });

    it('updates an open YouTube page (content script) with the merged list', async () => {
        fakeChrome = installFakeChrome({ [KEYWORDS]: ['cats'], [KEYWORDS_ON]: false, [PHRASES]: ['bad day'], [PHRASES_ON]: true });
        const storage = new BlackListStorage();
        await storage.init();
        storage.initHandler();

        await migrateLegacyPhrasesToKeywords();
        await flushStorageEvents();

        expect(storage.keywords).toEqual(['cats', 'bad day']);
        expect(storage.keywordsIsTurnedOn).toBeTrue();
    });
});
