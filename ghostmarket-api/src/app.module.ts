import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DownloadModule } from './download/download.module';


@Module({
  imports: [ProductsModule, AuthModule, OrdersModule, DownloadModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}