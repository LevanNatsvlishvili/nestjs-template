import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import { JWTStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [authController],
  providers: [authService, JWTStrategy],
})
export class AuthModule {}
