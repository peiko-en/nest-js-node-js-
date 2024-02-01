import { Response } from 'express';

import { ICookie } from '@libs/common/http';

export class ResponseHelper {
    static CookiesAssign(response: Response, cookies: ICookie[]): void {
        for (const cookie of cookies) {
            response.cookie(cookie.name, cookie.value, cookie.options);
        }
    }
}
