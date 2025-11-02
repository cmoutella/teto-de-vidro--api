import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { AccessLevelPoliciesModule } from '../accessLevelPolicies/access-level-policies.module'
import { InvitationModule } from '../invitation/invitation.module'
import { ApplicationUsersController } from './controllers/admin/application-users.admin.controller'
import { UsersAdminController } from './controllers/admin/users.admin.controller'
import { UsersController } from './controllers/users.controller'
import { UserApplicationRepository } from './repositories/application.repository'
import { ApplicationMongooseRepository } from './repositories/mongoose/application.mongoose.repository'
import { UserLimitsMongooseRepository } from './repositories/mongoose/user-limits.mongoose.repository'
import { UserMongooseRepository } from './repositories/mongoose/user.mongoose.repository'
import { UserLimitsRepository } from './repositories/user-limits.repository'
import { UserRepository } from './repositories/user.repository'
import {
  ApplicationUser,
  ApplicationUserSchema
} from './schemas/application.schema'
import { UserLimits, UserLimitsSchema } from './schemas/user-limits.schema'
import { User, UserSchema } from './schemas/user.schema'
import { ApplicationUserService } from './services/application-user.service'
import { UserLimitsService } from './services/user-limits.service'
import { UserAdminService } from './services/user.admin.service'
import { UserPublicService } from './services/user.public.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: ApplicationUser.name, schema: ApplicationUserSchema }
    ]),
    MongooseModule.forFeature([
      { name: UserLimits.name, schema: UserLimitsSchema }
    ]),
    forwardRef(() => AppModule),
    forwardRef(() => InvitationModule),
    forwardRef(() => AccessLevelPoliciesModule)
  ],
  providers: [
    {
      provide: UserRepository,
      useClass: UserMongooseRepository
    },
    {
      provide: UserApplicationRepository,
      useClass: ApplicationMongooseRepository
    },
    {
      provide: UserLimitsRepository,
      useClass: UserLimitsMongooseRepository
    },
    UserPublicService,
    UserAdminService,
    ApplicationUserService,
    UserLimitsService
  ],
  controllers: [
    UsersAdminController,
    ApplicationUsersController,
    UsersController
  ],
  exports: [
    UserPublicService,
    UserAdminService,
    ApplicationUserService,
    UserLimitsService
  ]
})
export class UsersCollectionModule {}
