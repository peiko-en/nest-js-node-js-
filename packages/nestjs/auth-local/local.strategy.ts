import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { ValidationException } from '@libs/common/exceptions';
import { ClassValidatorExceptionFactory } from '@libs/common/validation';
import { AuthService } from '@libs/modules/auth';

import { LOCAL_AUTH_OPTIONS } from './local.constants';
import { LocalAuthGuardOptions, LocalAuthResult } from './local.types';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
    private readonly validationClass: ClassConstructor<any> | undefined;

    constructor(
        @Inject(LOCAL_AUTH_OPTIONS) options: LocalAuthGuardOptions,
        private readonly authService: AuthService,
    ) {
        let validationClass;
        if (options?.validationClass) {
            validationClass = options.validationClass;
            delete options.validationClass;
        }

        super(Object.assign({}, options, { passReqToCallback: false }));

        this.validationClass = validationClass;
    }

    authenticate(req: Request, options?: any): void {
        this.validateRequest(req);
        super.authenticate(req, options);
    }

    async validate(email: string, password: string): Promise<LocalAuthResult> {
        const user = await this.authService.validateLogin({ username: email, password });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }

    private validateRequest(req: Request): void {
        let errors: ValidationError[] = [];

        if (this.validationClass) {
            const plainClass = plainToInstance(this.validationClass, req.body, {
                enableImplicitConversion: true,
            });
            errors = validateSync(plainClass);
        }

        if (errors.length > 0) {
            throw new ValidationException(new ClassValidatorExceptionFactory(errors).toObjectErrors());
        }
    }
}
