import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../email/email.module';
import { DownloadModule } from '../download/download.module';

@Module({
  // Use forwardRef no módulo que está causando o loop (EmailModule)
  imports: [
    forwardRef(() => EmailModule), // <-- Correção para dependência circular
    DownloadModule, // <-- Import for secure token generation
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule { }