import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { UserService } from '@src/modules/user/services/user.service'
import { ZodValidationPipe } from '@src/shared/pipe/zod-validation.pipe'
import { compare } from 'bcryptjs'
import { addDays } from 'date-fns'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'

import { AuthCredentials } from '../schemas/models/auth.interface'
import { loginSchema } from '../schemas/zod-validation/login.zod-validation'

@ApiTags('auth')
@UseInterceptors(LoggingInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  @ApiOperation({ summary: 'Autentica um usuário' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  @Post('/login')
  async authUser(@Body() credentials: AuthCredentials) {
    const { email, password } = credentials

    const foundUser = await this.userService.getByEmail(email)

    const passwordMatch = await compare(password, foundUser.password)

    if (!passwordMatch) throw new Error('Usuário ou senha incorretos')

    const { password: _password, createdAt: _cat, ...otherData } = foundUser

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      accessLevel: foundUser.accessLevel,
      role: foundUser.role
    }

    const authDate = new Date()
    const token = await this.jwtService.sign(payload)
    const tokenExpiration = addDays(authDate, 15)

    return {
      token: token,
      user: otherData,
      expireAt: tokenExpiration.toISOString()
    }
  }

  @ApiOperation({ summary: 'Autentica uma aplicação' })
  @Post('/apps')
  async authApps(@Body() credentials: AuthCredentials) {
    const { email, password } = credentials

    const foundUser = await this.userService.getByEmail(email)

    if (foundUser.role !== 'app') {
      throw new BadRequestException()
    }

    const passwordMatch = await compare(password, foundUser.password)

    if (!passwordMatch) throw new Error('Usuário ou senha incorretos')

    const { password: _password, createdAt: _cat, ...otherData } = foundUser

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      accessLevel: foundUser.accessLevel,
      role: foundUser.role
    }

    const authDate = new Date()
    const token = await this.jwtService.sign(payload)
    const tokenExpiration = addDays(authDate, 15)

    return {
      token: token,
      user: otherData,
      expireAt: tokenExpiration.toISOString()
    }
  }
}
