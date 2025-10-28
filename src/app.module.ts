import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller'
import { AccessLevelPoliciesModule } from './modules/accessLevelPolicies/access-level-policies.module'
import { AddressModule } from './modules/address/address.module'
import { AmenitiesCollectionModule } from './modules/amenity/amenity.module'
import { AuthModule } from './modules/auth/auth.module'
import { CommentsCollectionModule } from './modules/comments/comments.module'
import { HuntCollectionModule } from './modules/hunt/hunt-collection.module'
import { InvitationModule } from './modules/invitation/invitation.module'
import { ScraperModule } from './modules/scraper/scraper.module'
import { TargetPropertyCollectionModule } from './modules/targetProperty/target-property.module'
import { UsersCollectionModule } from './modules/users/user.module'
import { AppService } from './services/app.service'
import { CEPService } from './services/cep/cep.service'
import { MailService } from './services/mail/mail.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15d' }
    }),
    UsersCollectionModule,
    InvitationModule,
    AuthModule,
    AccessLevelPoliciesModule,
    TargetPropertyCollectionModule,
    HuntCollectionModule,
    AddressModule,
    ScraperModule,
    AmenitiesCollectionModule,
    CommentsCollectionModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService, CEPService],
  exports: [AppService, MailService, CEPService]
})
export class AppModule {}
