import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Response as HttpResponse } from 'express';
import { map, Observable } from 'rxjs';

import { ICookie } from '../cookies/cookie';
import { Resource, ResourceCollection } from '../resources';
import { ApiResponse, ApiSuccessResponse } from '../response/api-response';

type Responsable = ResourceCollection | Resource | ApiResponse | object | undefined;

@Injectable()
export class ApiResponseTransformerInterceptor implements NestInterceptor<any, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map(data => this.transformResponse(context.switchToHttp().getResponse(), data)));
    }

    private transformResponse(response: HttpResponse, responsable: Responsable): ApiSuccessResponse<any> {
        const apiResponse = this.getApiResponse(responsable);
        const cookies = Object.values(apiResponse.cookies);
        const headers = apiResponse.headers;

        if (cookies.length) {
            this.setCookies(response, cookies);
        }

        if (typeof headers === 'object' && headers !== null) {
            this.setHeaders(response, headers);
        }

        return {
            statusCode: apiResponse.statusCode,
            data: apiResponse.data,
            meta: apiResponse.meta,
            pagination: apiResponse.pagination,
        };
    }

    private getApiResponse(responsable: Responsable): ApiResponse {
        if (responsable instanceof ApiResponse) {
            return responsable;
        } else if (responsable instanceof Resource || responsable instanceof ResourceCollection) {
            return responsable.toResponse();
        }

        return new ApiResponse(responsable);
    }

    private setCookies(response: HttpResponse, cookies: ICookie[]): void {
        for (const cookie of cookies) {
            response.cookie(cookie.name, cookie.value, cookie.options);
        }
    }

    private setHeaders(response: HttpResponse, headers: ApiResponse['headers']): void {
        Object.entries(headers).forEach(([name, value]) => {
            response.setHeader(name, value);
        });
    }
}
