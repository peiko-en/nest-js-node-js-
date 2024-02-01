import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ClientsModuleAsyncOptions } from '@nestjs/microservices/module/interfaces';

import { ClsService } from '@libs/common/cls';
import { AllConfig } from '@libs/common/config';

import { RmqModuleOptions } from './rmq-module.interface';
import { RmqClient } from './rmq.client';
import { RmqService } from './rmq.service';

@Global()
@Module({
    providers: [RmqService],
    exports: [RmqService],
})
export class RmqModule {
    static register(options: (RmqModuleOptions & { provide?: string })[]): DynamicModule {
        return {
            module: RmqModule,
            imports: [ClientsModule.registerAsync(getOptions(options))],
            exports: [ClientsModule],
        };
    }
}

function getOptions(options: (RmqModuleOptions & { provide?: string })[]): ClientsModuleAsyncOptions {
    return options.map(({ provide, queue, ...opts }) => ({
        name: provide || queue.toUpperCase() + '_CLIENT',
        useFactory: (configService: ConfigService<AllConfig>, clsService: ClsService) => ({
            customClass: RmqClient,
            options: {
                urls: [configService.getOrThrow('rabbitmq.uri', { infer: true })],
                queue: configService.getOrThrow(`rabbitmq.queues.${queue}`, { infer: true }),
                queueOptions: { durable: true },
                clsService,
                ...opts,
            },
        }),
        inject: [ConfigService, ClsService],
    }));
}
