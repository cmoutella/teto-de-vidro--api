import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { AccessLevelPoliciesModule } from '../accessLevelPolicies/access-level-policies.module'
import { InvitationModule } from '../invitation/invitation.module'
import { ApplicationUsersController } from './controllers/admin/application-users.admin.controller'
import { UsersAdminController } from './controllers/admin/users.admin.controller'
import { UsersController } from './controllers/users.controller'
import { UserMongooseRepository } from './repositories/mongoose/user.mongoose.repository'
import { UserRepository } from './repositories/user.repository'
import { User, UserSchema } from './schemas/user.schema'
import { ApplicationUserService } from './services/application-user.service'
import { UserAdminService } from './services/user.admin.service'
import { UserPublicService } from './services/user.public.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AppModule),
    forwardRef(() => InvitationModule),
    forwardRef(() => AccessLevelPoliciesModule)
  ],
  providers: [
    {
      provide: UserRepository,
      useClass: UserMongooseRepository
    },
    UserPublicService,
    UserAdminService,
    ApplicationUserService
  ],
  controllers: [
    UsersAdminController,
    ApplicationUsersController,
    UsersController
  ],
  exports: [
    UserPublicService,
    UserAdminService,
    UserRepository,
    ApplicationUserService
  ]
})
export class UsersCollectionModule {}
