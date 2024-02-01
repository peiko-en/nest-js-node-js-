import { Params } from 'nestjs-pino';

export const LOGGER_MODULE_OPTIONS_PROVIDER = 'LOGGER_MODULE_OPTIONS_PROVIDER';

export type LoggerModuleOptions = Params & { pinoRpc?: { autoLogging?: boolean } };
