import { forwardRef, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AppModule } from '@src/app.module'

import { UsersCollectionModule } from '../users/user.module'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'

@Module({
  imports: [
    PassportModule,
    forwardRef(() => AppModule),
    forwardRef(() => UsersCollectionModule)
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
