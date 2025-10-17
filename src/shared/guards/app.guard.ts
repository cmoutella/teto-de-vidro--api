import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  private extractKeyFromHeader(request: Request) {
    const appKey = request.headers['x-api-key'] ?? ''

    return appKey
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const appKey = this.extractKeyFromHeader(request)

    if (!appKey) {
      throw new UnauthorizedException()
    }

    try {
      const payload: { appName: string; role: string } =
        await this.jwtService.verifyAsync(appKey as string, {
          secret: this.configService.get<string>('JWT_SECRET')
        })

      if (!payload.appName || !payload.role || payload.role !== 'app') {
        throw new UnauthorizedException('Token inválido')
      }

      request['application'] = payload
      return true
    } catch (err) {
      console.error('Erro na validação do token:', (err as Error).message)
      throw new UnauthorizedException('Token inválido ou expirado')
    }
  }
}
