import { RmqOptions as NestRmqOptions } from '@nestjs/microservices';

import { AllConfig } from '@libs/common/config';

export type RmqModuleOptions = NestRmqOptions['options'] & { queue: keyof AllConfig['rabbitmq']['queues'] };
