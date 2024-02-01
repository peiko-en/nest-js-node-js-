import { CacheModule as NCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { CacheStore } from '@nestjs/common/cache';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { AllConfig, RedisConfig } from '@libs/common/config';

import { CacheService } from './cache.service';

@Global()
@Module({
    imports: [
        NCacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<AllConfig>) => {
                const config: RedisConfig = configService.get('redis', { infer: true })!;

                // Hack: see this issue https://github.com/dabroek/node-cache-manager-redis-store/issues/40
                return {
                    store: (await redisStore({
                        socket: {
                            host: config.host,
                            port: config.port,
                        },
                        ttl: config.ttl,
                    })) as unknown as CacheStore,
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [CacheService],
    exports: [NCacheModule, CacheService],
})
export class CacheModule {}
