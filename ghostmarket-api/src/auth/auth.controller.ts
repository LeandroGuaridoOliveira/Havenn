import { Controller, Post, Body, UnauthorizedException, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) { }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Request() req: any) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      // Log failed login attempt
      await this.auditService.logEvent(
        'LOGIN_FAILED',
        undefined,
        body.email,
        req.ip,
        req.headers['user-agent'],
        `Failed login attempt for email: ${body.email}`
      );
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Log successful login
    await this.auditService.logEvent(
      'LOGIN_SUCCESS',
      user.id,
      user.email,
      req.ip,
      req.headers['user-agent']
    );

    return this.authService.login(user);
  }

  // Rota temporária para criar o primeiro admin
  // Depois você pode apagar ou proteger esta rota
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('register-customer')
  async registerCustomer(@Body() body: { email: string; password: string }) {
    return this.authService.registerCustomer(body.email, body.password);
  }

  // Get authenticated user profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    const user = await this.authService.findUserById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const { password, ...result } = user;
    return result;
  }
}