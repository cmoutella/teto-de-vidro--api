import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersCollectionModule,
    AccessLevelPoliciesModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15d' }
    }),
    AuthModule,
    HuntCollectionModule,
    TargetPropertyCollectionModule,
    AddressModule,
    AmenitiesCollectionModule,
    CommentsCollectionModule,
    InvitationModule,
    ScraperModule
  ]
})
export class AppModule {}
