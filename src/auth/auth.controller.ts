import { Body, Controller, Post } from '@nestjs/common/decorators';
import { authService } from './auth.service';
import { ForgotDTO, LoginDTO, SignupDTO } from './dto';

@Controller('auth')
export class authController {
  constructor(private auth: authService) {}
  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.auth.login(dto);
  }

  @Post('forgot')
  forgot(@Body() dto: ForgotDTO) {
    return this.auth.forgot(dto);
  }

  // @Post('reset')
  // reset(@Body() dto: AuthDTO) {
  //   return this.auth.login(dto);
  // }
}
