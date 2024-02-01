import { json } from 'body-parser';
import type { NextHandleFunction } from 'connect';
import { Request, Response } from 'express';

export function rawBodyMiddleware(): NextHandleFunction {
    return json({
        verify: (request: Request & { rawBody: Buffer }, _response: Response, buffer: Buffer) => {
            if (Buffer.isBuffer(buffer)) {
                request['rawBody'] = Buffer.from(buffer);
            }
            return true;
        },
    });
}
