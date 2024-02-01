import { Class } from '@libs/common/types';
import { isPagination, Pagination } from '@libs/core/interfaces';

import { ApiPaginationResponse, ApiResponse } from '../../response';

import { Resource } from './resource';

export class ResourceCollection<T = any> {
    private readonly items: any[];

    private readonly pagination: ApiPaginationResponse | undefined;

    private readonly additionalData: any;

    constructor(
        private resource: Class<Resource<T>>,
        data: Array<any> | Pagination<any>,
        additionalData?: any,
    ) {
        if (isPagination(data)) {
            this.items = data.items;
            this.pagination = {
                total: data.total,
                page: data.page,
                limit: data.limit,
            };
        } else {
            this.items = data;
        }

        this.additionalData = additionalData;
    }

    values(): T[] {
        return this.items.map(item => new this.resource(item, this.additionalData).values());
    }

    toResponse(): ApiResponse<T[]> {
        return new ApiResponse(this.values(), { pagination: this.pagination });
    }
}
