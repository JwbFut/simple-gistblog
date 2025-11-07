type CacheEntry<T> = {
    value: T;
    expiresAt: Date;
    staleAt: Date;
    lastUpdated: Date;
};

class SyncLock {
    private resolve: () => void;

    constructor() {
        this.resolve = () => { };
    }

    lock(): Promise<void> {
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    unlock() {
        this.resolve();
    }
}

export type fetcherResult<T> = {
    value: T;
    lastUpdated: Date;
};

class ServerSideCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private lock: Map<string, Promise<void>> = new Map();

    // If failed to update the entry, remove it from the cache and return undefined.
    private async updateEntry(key: string, fetcher: () => Promise<fetcherResult<any>>, minCacheTime: number, maxCacheTime: number): Promise<any> {
        const now = new Date();

        let value: any;
        let lastUpdated: Date;

        try {
            const result = await fetcher();
            value = result.value;
            lastUpdated = result.lastUpdated;
        } catch (error) {
            this.cache.delete(key);
            return undefined;
        }

        const expiresAt = new Date(now.getTime() + maxCacheTime * 1000);
        const staleAt = new Date(now.getTime() + minCacheTime * 1000);

        this.cache.set(key, { value, expiresAt, staleAt, lastUpdated });

        return value;
    }

    private async updateBackground(key: string, fetcher: () => Promise<fetcherResult<any>>, minCacheTime: number, maxCacheTime: number): Promise<void> {
        // Another update is already in progress, so skip this one.
        if (this.lock.has(key)) {
            return;
        }

        const lock = new SyncLock();
        this.lock.set(key, lock.lock());

        try {
            await this.updateEntry(key, fetcher, minCacheTime, maxCacheTime);
        } finally {
            this.lock.delete(key);
            lock.unlock();
        }
    }

    async get<T>(key: string, fetcher: () => Promise<fetcherResult<T>>, lastUpdated: Date | undefined, minCacheTime: number = 0, maxCacheTime: number = Infinity): Promise<T | undefined> {
        const now = new Date();
        const entry = this.cache.get(key);
        const lockPromise = this.lock.get(key);

        // If lastUpdated <= entry.lastUpdated, return anyway.
        if (entry && lastUpdated && entry.lastUpdated <= lastUpdated) {
            return entry.value;
        }

        // If the entry is not in the cache or is expired, fetch a new value
        if (!entry || entry.expiresAt < now) {
            // If there is a lock for this entry, wait for it to be released.
            // After the lock is released, the entry must have been updated, so we can return it anyway.
            // It can be undefined if the fetcher failed.
            if (lockPromise) {
                await lockPromise;
                return this.cache.get(key)?.value;
            }

            const lock = new SyncLock();
            this.lock.set(key, lock.lock());

            try {
                return await this.updateEntry(key, fetcher, minCacheTime, maxCacheTime);
            } finally {
                this.lock.delete(key);
                lock.unlock();
            }
        }

        // If the entry is not stale, return anyway.
        if (entry.staleAt > now) {
            return entry.value;
        }

        // If the entry is stale, return the value but also update it in the background
        this.updateBackground(key, fetcher, minCacheTime, maxCacheTime);
        return entry.value;
    }
}

export const serverSideCache = new ServerSideCache();