import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Bindings, Enviroment } from '../shared/types/app'

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getEnvironment(): Enviroment {
    const currentEnv =
      this.configService.get<string>('NODE_ENV') || 'development'
    return currentEnv as Enviroment
  }

  isProd(): boolean {
    return this.getEnvironment() === 'production'
  }

  isDev(): boolean {
    return this.getEnvironment() === 'development'
  }

  isTest(): boolean {
    return this.getEnvironment() === 'test'
  }

  envVars(): Bindings {
    const variables = {} as Record<keyof Bindings, string>

    for (const key of Object.keys(process.env) as (keyof Bindings)[]) {
      if (key in (process.env as Bindings)) {
        variables[key] = process.env[key] as string
      }
    }

    return variables
  }
}
