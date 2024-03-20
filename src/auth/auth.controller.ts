import { Body, Controller, Post } from '@nestjs/common/decorators';
import { authService } from './auth.service';
import { AuthDTO } from './dto';

@Controller('auth')
export class authController {
  constructor(private auth: authService) {}
  @Post('signup')
  signup(@Body() dto: AuthDTO) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: AuthDTO) {
    return this.auth.login(dto);
  }
}
