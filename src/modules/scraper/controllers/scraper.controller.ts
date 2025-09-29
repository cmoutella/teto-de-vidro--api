import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UnauthorizedException,
  UseInterceptors
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from '@src/modules/auth/services/auth.service'
import { ApplicationUserService } from '@src/modules/user/services/application-user.service'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'

import { ScrapedAdData } from '../schemas/scraper.schema'

@ApiTags('scraper')
@UseInterceptors(LoggingInterceptor)
@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: ApplicationUserService
  ) {}

  @ApiResponse({
    type: ScrapedAdData,
    status: 200,
    description: 'Dados encontrado no anúncio'
  })
  @Get('/')
  async scrapeAd(@Query() { url }: { url: string }) {
    try {
      const scraperService = process.env.SCRAPER_SERVICE
      if (!scraperService) {
        console.error('secret SCRAPER_SERVICE not set')
        throw new Error()
      }

      const scraperClient = process.env.SCRAPER_APP_CLIENT
      const scraperKey = process.env.SCRAPER_APP_KEY
      if (!scraperClient || !scraperKey) {
        console.error('secret SCRAPER_APP_CLIENT or SCRAPER_APP_KEY not set')
        throw new UnauthorizedException()
      }

      const app = await this.userService.getByName(scraperClient)

      if (!app || app.role !== 'app') {
        throw new UnauthorizedException('Credenciais inválidas')
      }

      const data = await this.authService.authenticateApplication(app, {
        email: app.email,
        password: scraperKey
      })

      if (!data.token) {
        throw new UnauthorizedException(
          'Não foi possível autenticar suas credenciais'
        )
      }

      const headers = new Headers()
      headers.append('Authorization', `Bearer ${data.token}`)

      const response = await fetch(`${scraperService}/ad/?url=${url}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedException()
        }

        throw new InternalServerErrorException('Scraper service error')
      }

      const adData = await response.json()

      return adData
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err
      }

      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }
}
