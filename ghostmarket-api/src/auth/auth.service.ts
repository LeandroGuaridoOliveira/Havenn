
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  // Valida se o usuário existe e a senha bate
  async validateUser(email: string, pass: string): Promise<Omit<any, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Gera o Token de acesso
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role  // Include role for authorization
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user // Return user info (without password) for frontend convenience
    };
  }

  // Método auxiliar para criarmos o primeiro Admin (já que não temos tela de registro)
  async register(email: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    const { password, ...result } = user;
    return result;
  }

  // Método para registro de clientes
  async registerCustomer(email: string, pass: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });
    const { password, ...result } = user;
    return result;
  }
}