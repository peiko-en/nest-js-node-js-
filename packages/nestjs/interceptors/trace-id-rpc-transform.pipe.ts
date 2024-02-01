import { Injectable, PipeTransform } from '@nestjs/common';

import { TRACE_ID } from '@libs/common/constants';

@Injectable()
export class TraceIdRpcTransformPipe implements PipeTransform {
    transform(value: any): any {
        // @see TCPClient.assignTraceId()
        if (value?.[TRACE_ID] && value?.data !== undefined) {
            return { ...value.data };
        }
        return value;
    }
}
