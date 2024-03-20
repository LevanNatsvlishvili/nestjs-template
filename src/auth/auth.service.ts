import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';

@Injectable()
export class authService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDTO) {
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
  async login(dto: AuthDTO) {
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
}
