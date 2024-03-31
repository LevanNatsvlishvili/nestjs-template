import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTStrategy } from './strategy';
import { TokenService } from './authToken.service';

@Module({
  imports: [
    JwtModule.register({}),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import the ConfigModule if you're using it
      useFactory: (configService: ConfigService) => ({
        transport: configService.get('MAIL_TRANSPORT'), // Example: 'smtp://user:pass@localhost:25'
        defaults: {
          from: '"No Reply" <no-reply@example.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JWTStrategy],
})
export class AuthModule {}
