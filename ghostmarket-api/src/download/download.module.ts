import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DownloadController],
  providers: [DownloadService, PrismaService],
  exports: [DownloadService], // Export for use in OrdersModule
})
export class DownloadModule { }
