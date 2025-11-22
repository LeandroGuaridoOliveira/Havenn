import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  // Rota temporária para criar o primeiro admin
  // Depois você pode apagar ou proteger esta rota
  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body.email, body.password);
  }
}