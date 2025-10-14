import { forwardRef, Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { UsersCollectionModule } from '../users/user.module'
import { ScraperController } from './controllers/scraper.controller'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersCollectionModule)
  ],
  controllers: [ScraperController]
})
export class ScraperModule {}
