import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InterfaceApplicationUser } from '@src/modules/users/schemas/models/application.interface'
import { InterfaceUser } from '@src/modules/users/schemas/models/user.interface'
import { compare } from 'bcryptjs'
import { addDays } from 'date-fns'

import { AuthCredentials } from '../schemas/models/auth.interface'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async authenticateUser(user: InterfaceUser) {
    const { password: _password, createdAt: _cat, ...otherData } = user

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      accessLevel: user.accessLevel,
      role: user.role
    }

    const authDate = new Date()
    const token = await this.jwtService.sign(payload, { expiresIn: '15d' })
    const tokenExpiration = addDays(authDate, 15)

    return {
      token: token,
      user: otherData,
      expireAt: tokenExpiration.toISOString()
    }
  }

  async authenticateApplication(
    application: InterfaceApplicationUser,
    credentials: AuthCredentials
  ) {
    if (application.role !== 'app') {
      return
    }

    const passwordMatch = await compare(
      credentials.password,
      application.password
    )

    if (!passwordMatch) throw new Error('Usuário ou senha incorretos')

    const { password: _password, createdAt: _cat, ...otherData } = application

    const payload = {
      appName: application.name,
      role: application.role
    }

    const authDate = new Date()
    const token = await this.jwtService.sign(payload, { expiresIn: '5d' })
    const tokenExpiration = addDays(authDate, 100)

    return {
      token: token,
      user: otherData,
      expireAt: tokenExpiration.toISOString()
    }
  }
}
