type CacheEntry<T> = {
    timestamp: number;
    value: T;
};

export class LRUCache<K, V> {
    private readonly maxSize: number;
    private cache: Map<K, CacheEntry<V>>;

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        this.cache.delete(key);
        this.cache.set(key, { ...entry, timestamp: Date.now() });

        return entry.value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey!);
        }

        this.cache.set(key, {
            timestamp: Date.now(),
            value
        });
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    clear(): void {
        this.cache.clear();
    }
}