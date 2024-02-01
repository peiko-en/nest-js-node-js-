import { ClientRMQ, RmqOptions, RmqRecordOptions } from '@nestjs/microservices';

import { ClsService } from '@libs/common/cls';
import { TRACE_ID } from '@libs/common/constants';

export type RmqClientOptions = RmqOptions['options'] & { clsService: ClsService };

export interface RmqInputData<T = any> {
    data: T;
    options?: RmqRecordOptions;
}

export class RmqClient extends ClientRMQ {
    protected clsService: ClsService;

    constructor({ clsService, ...options }: RmqClientOptions) {
        super(options);
        this.clsService = clsService;
    }

    protected mergeHeaders(requestHeaders?: Record<string, string>): Record<string, string> | undefined {
        return super.mergeHeaders({ [TRACE_ID]: this.clsService.getId(), ...requestHeaders });
    }
}
