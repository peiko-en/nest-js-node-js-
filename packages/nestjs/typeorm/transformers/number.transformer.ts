import { ValueTransformer } from 'typeorm';

export const numberTransformer: ValueTransformer = {
    from(value?: string | number): number {
        return Number(value) || 0;
    },
    to(value?: string | number): number {
        return Number(value) || 0;
    },
};
