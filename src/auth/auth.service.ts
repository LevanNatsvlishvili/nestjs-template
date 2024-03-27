import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotDTO, LoginDTO, SignupDTO } from './dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class authService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailer: MailerService,
  ) {}

  async signup(dto: SignupDTO) {
    try {
      const hashPass = await hash(dto.password);

      const user = await this.prisma.users.create({
        data: {
          email: dto.email,
          hash: hashPass,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('User already exists');
        }
      }
      throw e;
    }
  }
  async login(dto: LoginDTO) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Incorrect credentials');

    const pwMatch = await verify(user.hash, dto.password);

    if (!pwMatch) throw new ForbiddenException('Incorrect credentials');
    return this.generateToken(user.id, user.email);
  }

  async generateToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return { accessToken: token };
  }

  async forgot(dto: ForgotDTO) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    console.log(user);

    if (!user) throw new ForbiddenException('Incorrect credentials');

    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Store the reset code in the database with the user's email and expiration time
    // (Database interaction is not shown here)

    // Send the email with the reset code
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}`,
    });

    console.log(dto);
  }
}
