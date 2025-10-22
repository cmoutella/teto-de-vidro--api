import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { AddressModule } from '../address/address.module'
import { AmenitiesCollectionModule } from '../amenity/amenity.module'
import { CommentsCollectionModule } from '../comments/comments.module'
import { HuntCollectionModule } from '../hunt/hunt-collection.module'
import { TargetPropertyController } from './controllers/target-property.controller'
import { TargetPropertyMongooseRepository } from './repositories/mongoose/target-property.mongoose.repository'
import { TargetPropertyRepository } from './repositories/target-property.repository'
import {
  TargetProperty,
  TargetPropertySchema
} from './schemas/target-property.schema'
import { TargetPropertyService } from './services/target-property.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TargetProperty.name, schema: TargetPropertySchema }
    ]),
    forwardRef(() => AppModule),
    forwardRef(() => HuntCollectionModule),
    forwardRef(() => AddressModule),
    forwardRef(() => AmenitiesCollectionModule),
    forwardRef(() => CommentsCollectionModule)
  ],
  providers: [
    {
      provide: TargetPropertyRepository,
      useClass: TargetPropertyMongooseRepository
    },
    TargetPropertyService
  ],
  controllers: [TargetPropertyController],
  exports: [TargetPropertyService, TargetPropertyRepository]
})
export class TargetPropertyCollectionModule {}
