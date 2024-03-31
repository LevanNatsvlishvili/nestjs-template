import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateToken(userId: number, email: string): Promise<{ accessToken: string }> {
    const payload = { sub: userId, email };
    const secret = process.env.JWT_SECRET; // Or use a config service

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', //
      secret: secret,
    });

    return { accessToken: token };
  }
}
