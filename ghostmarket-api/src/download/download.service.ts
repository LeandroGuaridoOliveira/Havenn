import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

interface DownloadToken {
    orderId: string;
    productId: string;
    expiresAt: number;
}

@Injectable()
export class DownloadService {
    private readonly tokenSecret: string;
    private readonly tokenExpiration: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        // Load token configuration from environment
        this.tokenSecret = this.configService.get<string>('DOWNLOAD_TOKEN_SECRET') ||
            crypto.randomBytes(32).toString('hex'); // Fallback to random secret for development
        this.tokenExpiration = parseInt(
            this.configService.get<string>('DOWNLOAD_TOKEN_EXPIRATION') || '3600000', // 1 hour default
            10,
        );
    }

    /**
     * Generate a cryptographically signed download token
     * @param orderId The order ID
     * @param productId The product ID
     * @returns Encrypted token string
     */
    generateToken(orderId: string, productId: string): string {
        const expiresAt = Date.now() + this.tokenExpiration;

        const payload: DownloadToken = {
            orderId,
            productId,
            expiresAt,
        };

        // Create HMAC signature
        const payloadString = JSON.stringify(payload);
        const signature = this.createSignature(payloadString);

        // Combine payload and signature
        const token = Buffer.from(
            JSON.stringify({ ...payload, signature })
        ).toString('base64url');

        return token;
    }

    /**
     * Validate and decode a download token
     * @param token The encrypted token string
     * @returns Decoded token payload
     * @throws HttpException if token is invalid or expired
     */
    async validateToken(token: string): Promise<DownloadToken> {
        try {
            // Decode base64url token
            const decoded = JSON.parse(
                Buffer.from(token, 'base64url').toString('utf-8')
            );

            const { orderId, productId, expiresAt, signature } = decoded;

            // Validate structure
            if (!orderId || !productId || !expiresAt || !signature) {
                throw new HttpException(
                    'Token malformado ou inválido.',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            // Check expiration
            if (Date.now() > expiresAt) {
                throw new HttpException(
                    'Link de download expirado.',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            // Verify signature
            const payload: DownloadToken = { orderId, productId, expiresAt };
            const payloadString = JSON.stringify(payload);
            const expectedSignature = this.createSignature(payloadString);

            if (signature !== expectedSignature) {
                throw new HttpException(
                    'Token inválido ou adulterado.',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            return payload;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Token inválido ou corrompido.',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    /**
     * Retrieve file metadata from database and validate access
     * @param orderId The order ID
     * @param productId The product ID
     * @returns File path and metadata
     */
    async getFileMetadata(orderId: string, productId: string): Promise<{
        storageKey: string;
        productName: string;
    }> {
        // Verify that the order exists and contains the product
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    where: { productId },
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new HttpException(
                'Pedido não encontrado.',
                HttpStatus.NOT_FOUND,
            );
        }

        // Verify order is paid
        if (order.status !== 'PAID') {
            throw new HttpException(
                'Este pedido ainda não foi pago. Aguarde a confirmação do pagamento.',
                HttpStatus.FORBIDDEN,
            );
        }

        // Verify product is in the order
        const orderItem = order.items.find(item => item.productId === productId);
        if (!orderItem) {
            throw new HttpException(
                'Produto não encontrado neste pedido.',
                HttpStatus.FORBIDDEN,
            );
        }

        return {
            storageKey: orderItem.product.storageKey,
            productName: orderItem.product.name,
        };
    }

    /**
     * Create HMAC-SHA256 signature for a payload
     * @param payload The payload string to sign
     * @returns Hex-encoded signature
     */
    private createSignature(payload: string): string {
        return crypto
            .createHmac('sha256', this.tokenSecret)
            .update(payload)
            .digest('hex');
    }
}
