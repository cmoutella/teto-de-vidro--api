import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'

import { ScrapedAdData } from '../schemas/scraper.schema'

@ApiTags('scraper')
@UseInterceptors(LoggingInterceptor)
@Controller('scraper')
export class ScraperController {
  @ApiResponse({
    type: ScrapedAdData,
    status: 200,
    description: 'Dados encontrado no anúncio'
  })
  @Get('/')
  async scrapeAd(@Query() { url }: { url: string }) {
    const scraperService = process.env.SCRAPER_SERVICE

    if (!scraperService) {
      console.error('secret SCRAPER_SERVICE not set')
    }

    try {
      const response = await fetch(`${scraperService}/ad/?url=${url}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Scraper service error')
      }

      const adData = await response.json()

      return adData
    } catch (_err) {
      return { status: 500, message: 'Scraper error' }
    }
  }
}
