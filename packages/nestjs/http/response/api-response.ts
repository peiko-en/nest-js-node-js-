import { HttpStatus } from '@nestjs/common';
import { CookieOptions } from 'express';

import { ICookie } from '../cookies/cookie';

export interface ApiPaginationResponse {
    page: number;
    limit: number;
    total: number;
}

export interface ApiSuccessResponse<T> {
    statusCode: HttpStatus;
    data: T;
    pagination?: ApiPaginationResponse;
    meta?: any;
}

export interface ApiErrorResponse<T> {
    statusCode: HttpStatus;
    error: string;
    message: T;
}

export interface ResponseOptions {
    statusCode?: HttpStatus;
    headers?: Record<string, number | string | ReadonlyArray<string>>;
    cookies?: Record<string, ICookie>;
    meta?: Record<string, any>;
    pagination?: ApiPaginationResponse;
}

export class ApiResponse<T = any> {
    readonly statusCode: HttpStatus;

    readonly cookies: ResponseOptions['cookies'];

    readonly headers: ResponseOptions['headers'];

    readonly meta: ResponseOptions['headers'] | undefined;

    readonly pagination: ResponseOptions['pagination'] | undefined;

    constructor(
        public readonly data: T,
        options?: ResponseOptions,
    ) {
        this.statusCode = options?.statusCode;
        this.cookies = options?.cookies || {};
        this.headers = options?.headers || {};
        this.meta = options?.meta;
        this.pagination = options?.pagination;
    }

    withHeader(name: string, value: number | string | ReadonlyArray<string>): ApiResponse {
        Object.assign(this.headers, { [name]: value });
        return this;
    }

    withCookie(name: string, value: string, options?: CookieOptions): ApiResponse {
        Object.assign(this.cookies, { [name]: { name, value, options } });
        return this;
    }
}
