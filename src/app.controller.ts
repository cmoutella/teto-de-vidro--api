import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { AppGuard } from './shared/guards/app.guard'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'

@UseInterceptors(LoggingInterceptor)
@UseGuards(AppGuard)
@Controller('')
export class AppController {
  constructor() {}

  @ApiOperation({ summary: 'Para acordar aplicação e previnir cold starts' })
  @Get('/wakeup')
  async wakeApp() {
    return { message: 'App is awake', success: true }
  }
}
