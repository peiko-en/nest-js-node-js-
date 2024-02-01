import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { AllConfig } from '@libs/common/config';

import { RmqModuleOptions } from './rmq-module.interface';

@Injectable()
export class RmqService {
    constructor(private readonly configService: ConfigService<AllConfig>) {}

    getOptions(options: RmqModuleOptions): RmqOptions {
        const config = this.configService.getOrThrow('rabbitmq', { infer: true });
        const queue = config.queues[options.queue];

        if (!queue) {
            throw new Error('Queue is required');
        }

        return {
            transport: Transport.RMQ,
            options: {
                urls: [config.uri],
                queue,
                queueOptions: { durable: true },
                ...options,
            },
        };
    }

    static ack(context: RmqContext): void {
        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();
        channel.ack(originalMessage);
    }

    static nack(context: RmqContext, allUpTo = false, requeue = true): void {
        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();
        channel.nack(originalMessage, allUpTo, requeue);
    }
}
