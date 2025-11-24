import {
    Controller,
    Get,
    Query,
    Res,
    HttpException,
    HttpStatus,
    StreamableFile
} from '@nestjs/common';
import type { Response } from 'express';
import { DownloadService } from './download.service';
import * as path from 'path';
import * as fs from 'fs';
import { createReadStream } from 'fs';

@Controller('download')
export class DownloadController {
    constructor(private readonly downloadService: DownloadService) { }

    /**
     * Secure download endpoint
     * Route: GET /download/secure/:productId?token=...
     * 
     * This endpoint validates the encrypted token and streams the file
     * without exposing the actual file path to the client
     */
    @Get('secure/:productId')
    async handleDownload(
        @Query('token') token: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        // 1. Validate token is provided
        if (!token) {
            throw new HttpException(
                'Token de download não fornecido.',
                HttpStatus.BAD_REQUEST,
            );
        }

        // 2. Validate and decode token
        const payload = await this.downloadService.validateToken(token);

        // 3. Retrieve file metadata from database with access validation
        const { storageKey, productName } = await this.downloadService.getFileMetadata(
            payload.orderId,
            payload.productId,
        );

        // 4. Construct file path (never exposed to client)
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, storageKey);

        // 5. Verify file exists on disk
        if (!fs.existsSync(filePath)) {
            throw new HttpException(
                `Arquivo não encontrado no servidor. Entre em contato com o suporte.`,
                HttpStatus.NOT_FOUND,
            );
        }

        // 6. Get file stats for headers
        const fileStats = fs.statSync(filePath);

        // 7. Set response headers for download
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${productName}.zip"`,
            'Content-Length': fileStats.size,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        });

        // 8. Stream file to client (secure, memory-efficient)
        const fileStream = createReadStream(filePath);

        return new StreamableFile(fileStream);
    }
}