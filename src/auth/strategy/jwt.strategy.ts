import { Injectable } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

interface payloadProps {
  sub: number;
  email: string;
}

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: payloadProps) {
    const { sub } = payload;

    const user = await this.prisma.users.findUnique({
      where: { id: sub },
      select: { id: true, email: true, name: true },
    });

    return user;
  }
}
