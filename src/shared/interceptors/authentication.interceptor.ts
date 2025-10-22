import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import {
  AuthenticatedApplication,
  AuthenticatedUser
} from '@src/modules/auth/schemas/models/auth.interface'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      tap(() => {
        const user = request.user as AuthenticatedUser
        const application = request.application as AuthenticatedApplication

        if (user) {
          response.setHeader('x-client-id', user.id)
          response.setHeader('x-user-role', user.role)
          response.setHeader('x-user-level', user.accessLevel)
        }
        if (application) {
          response.setHeader('x-app-client', application.appName)
        }
      })
    )
  }
}
