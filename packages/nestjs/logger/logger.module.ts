import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';

import { DynamicModule, Global, Logger, Module, NestInterceptor, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule as NLoggerModule, Params } from 'nestjs-pino';
import pino from 'pino';
import { ReqId } from 'pino-http';

import { AllConfig, AppEnv } from '@libs/common/config';
import { X_REQUEST_ID } from '@libs/common/constants';

import { LoggingRpcInterceptor } from './interceptors/logging-rpc.interceptor';
import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_PROVIDER } from './logger-module.interface';
import { LoggerService } from './logger.service';

@Global()
@Module({
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {
    private static logger = new Logger(LoggerModule.name);

    static forRoot(options?: LoggerModuleOptions): DynamicModule {
        const optionsProvider: Provider<LoggerModuleOptions> = {
            provide: LOGGER_MODULE_OPTIONS_PROVIDER,
            useValue: options || {},
        };

        return {
            module: LoggerModule,
            imports: [
                NLoggerModule.forRootAsync({
                    useFactory: LoggerModule.nestPinoLoggerFactory,
                    inject: [ConfigService, LOGGER_MODULE_OPTIONS_PROVIDER],
                }),
            ],
            providers: [
                optionsProvider,
                LoggerService,
                {
                    provide: APP_INTERCEPTOR,
                    useFactory: LoggerModule.rpcLoggingInterceptorFactory,
                    inject: [LOGGER_MODULE_OPTIONS_PROVIDER],
                },
            ],
            exports: [LoggerService, LOGGER_MODULE_OPTIONS_PROVIDER],
        };
    }

    private static rpcLoggingInterceptorFactory(options: LoggerModuleOptions): NestInterceptor {
        if (options.pinoRpc?.autoLogging) {
            LoggerModule.logger.debug('RpcLoggingInterceptor will be automatically mounted');
            return new LoggingRpcInterceptor();
        }

        return {
            intercept: (_, next) => next.handle(),
        };
    }

    private static nestPinoLoggerFactory(conf: ConfigService<AllConfig>, options: LoggerModuleOptions = {}): Params {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pinoHttp, pinoRpc, ...moduleParams } = options;

        return {
            pinoHttp: {
                level: conf.get('app.log.level', { infer: true }),
                formatters: {
                    level: label => ({ level: label.toUpperCase() }),
                },
                genReqId: (req: IncomingMessage): ReqId => (req.headers[X_REQUEST_ID] as string) || randomUUID(),
                customAttributeKeys: { reqId: 'traceId' },
                // Define custom serializers
                serializers: {
                    err: pino.stdSerializers.err,
                    req: (req: IncomingMessage & { body: any }) => ({
                        ...pino.stdSerializers.req(req),
                        bodyParams: req['body'],
                    }),
                    res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
                },
                wrapSerializers: false,
                // Define a custom message
                customSuccessMessage: () => 'OK',
                customErrorMessage: () => 'ERROR',
                // Define a custom logger level
                customLogLevel: (
                    req: IncomingMessage,
                    res: ServerResponse<IncomingMessage>,
                    err?: Error,
                ): pino.LevelWithSilent => {
                    if (res.statusCode >= 300 && res.statusCode < 400) {
                        return 'silent';
                    } else if (res.statusCode >= 400 && res.statusCode < 500) {
                        return 'warn';
                    } else if (res.statusCode >= 500 || err) {
                        return 'error';
                    }
                    return 'info';
                },
                // Define additional custom request properties
                redact: {
                    paths: ['req.*.password', 'req.*.confirmPassword', 'req.*.accessToken'],
                    censor: '**SECRET-INFO**',
                },
                // Define pino-pretty
                transport:
                    conf.get('app.env', { infer: true }) === AppEnv.Dev
                        ? {
                              target: 'pino-pretty',
                              options: { singleLine: true },
                          }
                        : undefined,
                ...pinoHttp,
            },
            ...moduleParams,
        };
    }
}
