import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotDTO, LoginDTO, ResetDTO, SignupDTO } from './dto';
import { MailerService } from '@nestjs-modules/mailer';
import { generateResetCode } from './utils/resetCodeGenerator';
import { TokenService } from './authToken.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
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

  // Login method
  async login(dto: LoginDTO) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Incorrect credentials');

    const pwMatch = await verify(user.hash, dto.password);

    if (!pwMatch) throw new ForbiddenException('Incorrect credentials');

    return this.tokenService.generateTokens(user.id, user.email);
  }

  async refreshToken(dto: { refreshToken: string }) {
    const { accessToken, refreshToken } = await this.tokenService.refreshTokens(dto.refreshToken);
    return { accessToken, refreshToken };
  }

  async checkGeneratedResetCode(retryCount = 0) {
    const resetCode = generateResetCode();

    // Delete any existing expired codes
    if (retryCount === 0) {
      await this.prisma.passwordResets.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    }

    // Check if the reset code already exists in the database
    const existingReset = await this.prisma.passwordResets.findFirst({
      where: {
        code: resetCode,
      },
    });

    // if exists replace it with a new one
    if (existingReset) {
      if (retryCount > 5) {
        // Adjust the retry limit as needed
        throw new Error('Unable to generate unique reset code. Please try again later.');
      }
      return this.checkGeneratedResetCode(retryCount + 1);
    }

    return resetCode;
  }

  async forgot(dto: ForgotDTO) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Incorrect credentials');

    const resetCode = await this.checkGeneratedResetCode();

    // Create a new reset code in the database
    try {
      await this.prisma.passwordResets.create({
        data: {
          email: user.email,
          code: resetCode,
          expiresAt: new Date(Date.now() + 1000 * 60 * 1), // 15 minutes
        },
      });
    } catch (error) {
      throw new ForbiddenException('Code cannot be sent again for 1 minute after sending it. Please check your email.');
    }

    try {
      // Send the email with the reset code
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}. Please use this code to reset your password. If you did not request a password reset, please ignore this email.`,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email. Please try again later.');
    }

    return { message: 'Password reset code sent. Please check your email.' };
  }
  async reset(dto: ResetDTO) {
    const user = await this.prisma.passwordResets.findUnique({
      where: {
        email: dto.email,
        code: dto.resetCode,
      },
    });

    if (!user) throw new ForbiddenException('Incorrect credentials');

    if (user.expiresAt < new Date()) {
      throw new ForbiddenException('Reset code has expired');
    }

    const hashPass = await hash(dto.newPassword);

    await this.prisma.users.update({
      where: {
        email: dto.email,
      },
      data: {
        hash: hashPass,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
