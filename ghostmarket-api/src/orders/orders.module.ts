import { Module, forwardRef } from '@nestjs/common'; // <-- Importar forwardRef
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  // Use forwardRef no módulo que está causando o loop (EmailModule)
  imports: [
    forwardRef(() => EmailModule) // <-- Correção para dependência circular
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService], 
})
export class OrdersModule {}