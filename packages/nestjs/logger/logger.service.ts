import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Params, PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino';
import { Level } from 'pino';

import { ClsService } from '@libs/common/cls';
import { TRACE_ID } from '@libs/common/constants';

@Injectable()
export class LoggerService implements NestLoggerService {
    private readonly contextName: string;

    constructor(
        private readonly clsService: ClsService,
        protected readonly logger: PinoLogger,
        @Inject(PARAMS_PROVIDER_TOKEN) { renameContext }: Params,
    ) {
        this.contextName = renameContext || 'context';
    }

    verbose(message: any, ...optionalParams: any[]): void {
        this.call('trace', message, ...optionalParams);
    }

    debug(message: any, ...optionalParams: any[]): void {
        this.call('debug', message, ...optionalParams);
    }

    log(message: any, ...optionalParams: any[]): void {
        this.call('info', message, ...optionalParams);
    }

    warn(message: any, ...optionalParams: any[]): void {
        this.call('warn', message, ...optionalParams);
    }

    error(message: any, ...optionalParams: any[]): void {
        this.call('error', message, ...optionalParams);
    }

    private call(level: Level, message: any, ...optionalParams: any[]): void {
        const objArg: Record<string, any> = {
            [TRACE_ID]: this.clsService.getId(),
        };

        // optionalParams contains extra params passed to logger
        // context name is the last item
        let params: any[] = [];
        if (optionalParams.length !== 0) {
            objArg[this.contextName] = optionalParams[optionalParams.length - 1];
            params = optionalParams.slice(0, -1);
        }

        if (typeof message === 'object') {
            if (message instanceof Error) {
                objArg.err = message;
            } else {
                Object.assign(objArg, message);
            }
            this.logger[level](objArg, ...params);
        } else if (this.isWrongExceptionsHandlerContract(level, message, params)) {
            objArg.err = new Error(message);
            objArg.err.stack = params[0];
            this.logger[level](objArg);
        } else {
            this.logger[level](objArg, message, ...params);
        }
    }

    private isWrongExceptionsHandlerContract(level: Level, message: any, params: any[]): params is [string] {
        return (
            level === 'error' &&
            typeof message === 'string' &&
            params.length === 1 &&
            typeof params[0] === 'string' &&
            /\n\s*at /.test(params[0])
        );
    }
}
