import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppModule } from '@src/app.module'

import { InvitationRepository } from './repositories/invitation.repository'
import { InvitationMongooseRepository } from './repositories/mongoose/invitation.mongoose.repository'
import { Invitation, InvitationSchema } from './schema/invitation.schema'
import { InvitationService } from './service/invitation.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema }
    ]),
    forwardRef(() => AppModule)
  ],
  providers: [
    {
      provide: InvitationRepository,
      useClass: InvitationMongooseRepository
    },
    InvitationService
  ],
  exports: [InvitationService]
})
export class InvitationModule {}
