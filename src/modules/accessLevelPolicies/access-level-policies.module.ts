import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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
import { UserLimitService } from './services/user-limit.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessLevelPolicies.name, schema: AccessLevelPoliciesSchema }
    ]),
    forwardRef(() => InvitationModule),
    forwardRef(() => HuntCollectionModule)
  ],
  providers: [
    {
      provide: AccessLevelPoliciesRepository,
      useClass: AccessLevelPoliciesMongooseRepository
    },
    AccessLevelPoliciesService,
    UserLimitService
  ],
  controllers: [AccessLevelPoliciesController],
  exports: [UserLimitService]
})
export class AccessLevelPoliciesModule {}
