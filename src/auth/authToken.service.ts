import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(userId: number, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30s', // Access token expiry time
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '12h', // Refresh token expiry time
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
