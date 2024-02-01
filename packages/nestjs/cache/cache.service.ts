import { CACHE_MANAGER, CacheStoreSetOptions, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService implements CacheStore {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    del(key: string): void | Promise<void> {
        return this.cacheManager.del(key);
    }

    get<T>(key: string): Promise<T | undefined> | T | undefined {
        return this.cacheManager.get(key);
    }

    set<T>(key: string, value: T, options?: CacheStoreSetOptions<T> | number): Promise<void> | void {
        return this.cacheManager.set(key, value, options as any);
    }

    reset(): Promise<void> {
        return this.cacheManager.reset();
    }

    keys(pattern?: string): Promise<string[]> {
        return this.cacheManager.store.keys(pattern);
    }

    ttl(pattern?: string): Promise<number> {
        return this.cacheManager.store.ttl(pattern);
    }
}
