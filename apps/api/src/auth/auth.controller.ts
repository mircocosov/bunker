import { Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  @Post('guest')
  guest() {
    return {
      user_id: `guest_${randomUUID()}`,
      role: 'guest',
      access_token: randomUUID(),
    };
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return {
      user_id: body.email,
      role: 'player',
      access_token: randomUUID(),
    };
  }
}
