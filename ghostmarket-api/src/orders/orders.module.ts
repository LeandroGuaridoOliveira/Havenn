import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service'; // <-- Importe aqui

@Module({
  imports: [], // Não precisa importar outro módulo, apenas o serviço
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService], // <-- ADICIONE O PRISMASERVICE AQUI
})
export class OrdersModule {}