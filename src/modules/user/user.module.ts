import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AccessLevelPoliciesModule } from '../accessLevelPolicies/access-level-policies.module'
import { InvitationModule } from '../invitation/invitation.module'
import { ApplicationUsersController } from './controllers/admin/application-users.admin.controller'
import { UsersController } from './controllers/users.controller'
import { UserMongooseRepository } from './repositories/mongoose/user.mongoose.repository'
import { UserRepository } from './repositories/user.repository'
import { User, UserSchema } from './schemas/user.schema'
import { ApplicationUserService } from './services/application-user.service'
import { UserService } from './services/user.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => InvitationModule),
    forwardRef(() => AccessLevelPoliciesModule)
  ],
  providers: [
    {
      provide: UserRepository,
      useClass: UserMongooseRepository
    },
    UserService,
    ApplicationUserService
  ],
  controllers: [UsersController, ApplicationUsersController],
  exports: [UserService, UserRepository, ApplicationUserService]
})
export class UsersCollectionModule {}
