import { ApiResponse } from '@libs/common/http';
import { Pagination } from '@libs/core/interfaces';

import { ResourceCollection } from './resource-collection';

export abstract class Resource<R = any> {
    static collection<T, R, D = any>(items: Array<T> | Pagination<T>, additionalData?: D): ResourceCollection<R> {
        return new ResourceCollection<R>(this as any, items, additionalData);
    }

    abstract values(): R;

    toResponse(): ApiResponse<R> {
        return new ApiResponse(this.values());
    }
}
