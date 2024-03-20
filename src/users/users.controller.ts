import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Users } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  @Get('me')
  getActiveUser(@GetUser('') users: Users) {
    return users;
  }
}
