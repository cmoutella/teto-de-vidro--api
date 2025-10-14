import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { UserPublicService } from '@src/modules/users/services/user.public.service'
import { ZodValidationPipe } from '@src/shared/pipe/zod-validation.pipe'
import { compare } from 'bcryptjs'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'

import { AuthCredentials } from '../schemas/models/auth.interface'
import { loginSchema } from '../schemas/zod-validation/login.zod-validation'
import { AuthService } from '../services/auth.service'

@ApiTags('auth')
@UseInterceptors(LoggingInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserPublicService,
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: 'Autentica um usuário' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  @Post('/login')
  async authUser(@Body() credentials: AuthCredentials) {
    const { email, password } = credentials
    try {
      const foundUser = await this.userService.getByEmail(email)

      if (!foundUser) {
        throw new UnauthorizedException('Usuário ou senha incorretos')
      }

      const passwordMatch = await compare(password, foundUser.password)

      if (!passwordMatch) {
        throw new UnauthorizedException('Usuário ou senha incorretos')
      }

      const auth = this.authService.authenticateUser(foundUser)

      return auth
    } catch (error) {
      console.error('Erro no login de usuários:', error)

      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }

  @ApiOperation({ summary: 'Autentica uma aplicação' })
  @Post('/apps')
  async authApps(@Body() credentials: AuthCredentials) {
    const { email, password } = credentials
    try {
      const foundApp = await this.userService.getByEmail(email)

      if (foundApp.role !== 'app') {
        throw new UnauthorizedException()
      }

      const passwordMatch = await compare(password, foundApp.password)

      if (!passwordMatch) {
        throw new UnauthorizedException('Usuário ou senha incorretos')
      }

      const auth = this.authService.authenticateApplication(
        foundApp,
        credentials
      )

      return auth
    } catch (error) {
      console.error('Erro no login de aplicações:', error)

      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }
}
