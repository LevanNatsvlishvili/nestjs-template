import { Body, Controller, Post } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { ForgotDTO, LoginDTO, ResetDTO, SignupDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
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

  @Post('reset')
  reset(@Body() dto: ResetDTO) {
    return this.auth.reset(dto);
  }

  @Post('refresh-tokens')
  refresh(@Body() dto: { refreshToken: string }) {
    return this.auth.refreshToken(dto);
  }
}
