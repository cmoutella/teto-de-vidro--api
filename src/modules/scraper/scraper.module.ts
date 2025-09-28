import { Module } from '@nestjs/common'

import { ScraperController } from './controllers/scraper.controller'

@Module({
  controllers: [ScraperController]
})
export class ScraperModule {}
