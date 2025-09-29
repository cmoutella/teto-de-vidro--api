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
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? []

    return type === 'Bearer' ? token : null
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      })

      if (!payload.id || !payload.role) {
        throw new UnauthorizedException('Token inválido')
      }

      if (payload.role !== 'admin' && payload.role !== 'master') {
        throw new UnauthorizedException()
      }

      if (payload) request['user'] = payload
    } catch (_err) {
      throw new UnauthorizedException('Acesso não autorizado')
    }

    return true
  }
}
