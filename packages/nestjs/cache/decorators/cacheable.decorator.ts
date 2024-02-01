import { Inject } from '@nestjs/common';

import { CacheService } from '../cache.service';

type Seconds = number;

export function Cacheable(options?: { key: string | ((...args: any[]) => string); ttl?: Seconds }): MethodDecorator {
    const CacheServiceInjector = Inject(CacheService);

    return function decorator(target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        CacheServiceInjector(target, 'cacheService');

        const originalMethod = descriptor.value;

        descriptor.value = async function wrapper(...args: any[]): Promise<any> {
            try {
                const cacheService = (this as any).cacheService as CacheService;
                const key = typeof options?.key === 'function' ? options.key(args) : options?.key;

                if (!cacheService || !key) {
                    console.warn('@Cacheable was not set up with a caching client or key');
                    return originalMethod?.apply(this, args);
                }

                const cachedData = await cacheService.get(key);
                if (cachedData !== undefined && cachedData !== null) {
                    return cachedData;
                }
                const result = await originalMethod.apply(this, args);
                await cacheService.set(key, result, { ttl: options?.ttl });

                return result;
            } catch (err) {
                console.error('@Cacheable', err);
                return originalMethod?.apply(this, args);
            }
        };
    };
}
