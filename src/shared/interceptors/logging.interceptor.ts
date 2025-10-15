import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { AppService } from '@src/services/app.service'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly appService: AppService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()

    if (this.appService.isDev()) {
      console.log('#####################')
      console.log('Request received:', request.method)
      console.log('route', request.route.path)
      console.log('authorization_sent', request?.res?.req?.user?.email ?? '-')
    }

    const now = Date.now()

    return next
      .handle()
      .pipe(tap(() => console.log(`___After... ${Date.now() - now}ms`)))
  }
}
