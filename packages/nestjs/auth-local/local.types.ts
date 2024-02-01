import { ClassConstructor } from 'class-transformer';
import { IStrategyOptions, IStrategyOptionsWithRequest } from 'passport-local';

type LocalAuthStrategyOptionsWithoutRequest = {
    [K in keyof IStrategyOptions]: IStrategyOptions[K];
};

type LocalAuthStrategyOptionsWithRequest = {
    [K in keyof IStrategyOptionsWithRequest]: IStrategyOptionsWithRequest[K];
};

type LocalAuthStrategyOptionsExtra = {
    validationClass?: ClassConstructor<unknown>;
};

export type LocalAuthModuleOptions = LocalAuthStrategyOptionsExtra &
    (LocalAuthStrategyOptionsWithoutRequest | LocalAuthStrategyOptionsWithRequest);

export type LocalAuthGuardOptions = {
    [K in keyof LocalAuthModuleOptions]: LocalAuthModuleOptions[K];
};

export const localGuardDefaultOptions = {} as LocalAuthGuardOptions;

export interface LocalAuthModuleOptionsFactory {
    createModuleOptions(): Promise<LocalAuthModuleOptions> | LocalAuthModuleOptions;
}

export interface LocalAuthResult extends Express.User {}
