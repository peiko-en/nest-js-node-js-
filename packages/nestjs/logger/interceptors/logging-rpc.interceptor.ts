import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingRpcInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingRpcInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        this.logReceivedMessage(context);
        return next.handle();
    }

    private logReceivedMessage(ctx: ExecutionContext): void {
        if (ctx?.getType() !== 'rpc') return;

        const rpc = ctx.switchToRpc();
        try {
            this.logger.log({
                type: 'RPC',
                pattern: rpc.getContext().getPattern(),
                data: rpc.getData()?.data || rpc.getData(),
            });
        } catch (e) {
            this.logger.error(e);
        }
    }
}
