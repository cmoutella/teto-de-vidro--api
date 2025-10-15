import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { TargetPropertyCollectionModule } from '../targetProperty/target-property.module'
import { UsersCollectionModule } from '../users/user.module'
import { HuntController } from './controllers/hunt-collection.controller'
import { HuntRepository } from './repositories/hunt.repository'
import { HuntMongooseRepository } from './repositories/mongoose/hunt.mongoose.repository'
import { Hunt, HuntSchema } from './schemas/hunt.schema'
import { HuntService } from './services/hunt-collection.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hunt.name, schema: HuntSchema }]),
    forwardRef(() => AppModule),
    forwardRef(() => TargetPropertyCollectionModule),
    forwardRef(() => UsersCollectionModule)
  ],
  providers: [
    {
      provide: HuntRepository,
      useClass: HuntMongooseRepository
    },
    HuntService
  ],
  controllers: [HuntController],
  exports: [HuntService, HuntRepository]
})
export class HuntCollectionModule {}
