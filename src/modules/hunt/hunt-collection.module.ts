import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { TargetPropertyCollectionModule } from '../targetProperty/target-property.module'
import { UsersCollectionModule } from '../users/user.module'
import { HuntController } from './controllers/hunt-collection.controller'
import { HuntUsersRepository } from './repositories/hunt-users.repository'
import { HuntRepository } from './repositories/hunt.repository'
import { HuntUsersMongooseRepository } from './repositories/mongoose/hunt-users.mongoose.repository'
import { HuntMongooseRepository } from './repositories/mongoose/hunt.mongoose.repository'
import { HuntUser, HuntUserSchema } from './schemas/hunt-user.schema'
import { Hunt, HuntSchema } from './schemas/hunt.schema'
import { HuntService } from './services/hunt-collection.service'
import { HuntUsersService } from './services/hunt-users-collection.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hunt.name, schema: HuntSchema }]),
    MongooseModule.forFeature([
      { name: HuntUser.name, schema: HuntUserSchema }
    ]),
    forwardRef(() => AppModule),
    forwardRef(() => TargetPropertyCollectionModule),
    forwardRef(() => UsersCollectionModule)
  ],
  providers: [
    {
      provide: HuntRepository,
      useClass: HuntMongooseRepository
    },
    {
      provide: HuntUsersRepository,
      useClass: HuntUsersMongooseRepository
    },
    HuntUsersService,
    HuntService
  ],
  controllers: [HuntController],
  exports: [HuntService, HuntRepository]
})
export class HuntCollectionModule {}
