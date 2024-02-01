import { CookieOptions } from 'express';

export interface ICookie {
    name: string;
    value: any;
    options?: CookieOptions;
}
