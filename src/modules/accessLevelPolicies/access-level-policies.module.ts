import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { HuntCollectionModule } from '../hunt/hunt-collection.module'
import { InvitationModule } from '../invitation/invitation.module'
import { AccessLevelPoliciesController } from './controllers/access-level-policies.controller'
import { AccessLevelPoliciesRepository } from './repositories/access-level-policies.repository'
import { AccessLevelPoliciesMongooseRepository } from './repositories/mongoose/access-level-policies.mongoose.repository'
import {
  AccessLevelPolicies,
  AccessLevelPoliciesSchema
} from './schema/accessLevelPolicies.schema'
import { AccessLevelPoliciesService } from './services/access-level-policies.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessLevelPolicies.name, schema: AccessLevelPoliciesSchema }
    ]),
    forwardRef(() => AppModule),
    forwardRef(() => InvitationModule),
    forwardRef(() => HuntCollectionModule)
  ],
  providers: [
    {
      provide: AccessLevelPoliciesRepository,
      useClass: AccessLevelPoliciesMongooseRepository
    },
    AccessLevelPoliciesService
  ],
  controllers: [AccessLevelPoliciesController],
  exports: [AccessLevelPoliciesService]
})
export class AccessLevelPoliciesModule {}
