type StorageChangeListener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => void;

export interface FakeChrome {
    /** Current content of chrome.storage.sync. */
    readonly store: Record<string, unknown>;
    /** Every object passed to chrome.storage.sync.set, in call order. */
    readonly setCalls: Record<string, unknown>[];
    /** Every message passed to chrome.runtime.sendMessage, in call order. */
    readonly sentMessages: unknown[];
    readonly listenerCount: () => number;
    readonly restore: () => void;
}

const clone = <T>(value: T): T => value === undefined ? value : JSON.parse(JSON.stringify(value));

/** Waits until queued storage change events have been delivered. */
export function flushStorageEvents(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve));
}

/**
 * Installs a minimal in-memory replacement of the chrome extension APIs used by the black list.
 * Like the real API, values are copied on read/write and change events are delivered asynchronously.
 */
export function installFakeChrome(initialStore: Record<string, unknown> = {}): FakeChrome {
    const globalScope = globalThis as any;
    const originalChrome = globalScope.chrome;

    const store: Record<string, unknown> = clone(initialStore);
    const setCalls: Record<string, unknown>[] = [];
    const sentMessages: unknown[] = [];
    const listeners = new Set<StorageChangeListener>();

    const emit = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => {
        setTimeout(() => listeners.forEach(listener => listener(changes, 'sync')));
    };

    const toKeyList = (keys?: string | string[] | null): string[] =>
        keys == null ? Object.keys(store) : Array.isArray(keys) ? keys : [keys];

    globalScope.chrome = {
        storage: {
            sync: {
                get: async (keys?: string | string[] | null) => {
                    const result: Record<string, unknown> = {};
                    toKeyList(keys).forEach(key => {
                        if (key in store) result[key] = clone(store[key]);
                    });
                    return result;
                },
                set: async (items: Record<string, unknown>) => {
                    const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
                    Object.keys(items).forEach(key => {
                        changes[key] = { oldValue: clone(store[key]), newValue: clone(items[key]) };
                        store[key] = clone(items[key]);
                    });
                    setCalls.push(clone(items));
                    emit(changes);
                },
                remove: async (keys: string | string[]) => {
                    const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
                    toKeyList(keys).forEach(key => {
                        if (key in store) {
                            changes[key] = { oldValue: clone(store[key]) };
                            delete store[key];
                        }
                    });
                    emit(changes);
                },
            },
            onChanged: {
                addListener: (listener: StorageChangeListener) => listeners.add(listener),
                removeListener: (listener: StorageChangeListener) => listeners.delete(listener),
            },
        },
        runtime: {
            sendMessage: (message: unknown) => { sentMessages.push(clone(message)); },
        },
    };

    return {
        store,
        setCalls,
        sentMessages,
        listenerCount: () => listeners.size,
        restore: () => { globalScope.chrome = originalChrome; },
    };
}
