import { SelectQueryBuilder } from 'typeorm';

import { Pagination } from '@libs/core/interfaces';

const DEFAULT_LIMIT = 15;
const DEFAULT_PAGE = 1;

interface IPaginationOptions {
    page?: number;
    limit?: number;
}

export class PaginationQueryBuilder<Entity> {
    constructor(private readonly selectQueryBuilder: SelectQueryBuilder<Entity>) {}

    async paginate(options?: IPaginationOptions): Promise<Pagination<Entity>> {
        const page = this.resolveNumeric(options?.page, DEFAULT_PAGE);
        const limit = this.resolveNumeric(options?.limit, DEFAULT_LIMIT);

        const [items, total] = await this.selectQueryBuilder
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();

        return { items, page, limit, total };
    }

    private resolveNumeric(val: any, defaultVal: number): number {
        const resolvedVal = Number(val);

        if (Number.isInteger(resolvedVal) && resolvedVal >= 0) {
            return resolvedVal;
        }

        return defaultVal;
    }
}
