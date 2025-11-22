import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DownloadModule } from './download/download.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Configura o ConfigModule para carregar o .env e ser global
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ProductsModule,
    AuthModule,
    OrdersModule,
    DownloadModule,
    EmailModule, // <--- Adicionar EmailModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}