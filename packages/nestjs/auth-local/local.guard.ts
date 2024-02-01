import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LocalAuthGuardOptions, localGuardDefaultOptions } from './local.types';

@Injectable()
class LocalAuthGuard extends AuthGuard('local') {
    constructor(options?: LocalAuthGuardOptions) {
        super(Object.assign({}, localGuardDefaultOptions, options));
    }
}

export function UseLocalAuth(options?: LocalAuthGuardOptions): MethodDecorator & ClassDecorator {
    return UseGuards(new LocalAuthGuard(options));
}
