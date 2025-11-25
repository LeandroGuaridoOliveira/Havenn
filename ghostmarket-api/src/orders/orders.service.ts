// Importar módulos necessários para criptografia e hash
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { DownloadService } from '../download/download.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private downloadService: DownloadService // <-- Secure download token service
  ) { }

  // =========================================================================
  // MÉTODOS AUXILIARES E PRIVADOS
  // =========================================================================

  private async handlePaymentSuccess(orderId: string) {
    this.logger.log(`Simulando webhook: Pedido ${orderId} atualizado para PAID.`);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });
  }

  /**
   * Generate secure download URL with encrypted token
   * SECURITY: Replaced insecure key concatenation with HMAC-signed tokens
   */
  private getSecureDownloadUrl(orderId: string, productId: string): string {
    const token = this.downloadService.generateToken(orderId, productId);
    return `http://localhost:3333/download/secure/${productId}?token=${token}`;
  }

  // =========================================================================
  // 1. CRIAÇÃO DE PEDIDO (POST /orders)
  // =========================================================================

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const { items, total, customerEmail } = createOrderDto;

    // GERAÇÃO DA CHAVE DE LICENÇA ÚNICA (Anti-Pirataria)
    const licenseKey = crypto.randomUUID();

    // 1. Validar Usuário (Opcional, pois o JWT já garante)
    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // if (!user) throw new Error('Usuário não encontrado.');

    const orderItemsData = items.map((item) => ({
      productId: item.id,
      price: item.price,
    }));

    // 2. CRIAÇÃO DA ORDEM COM FK E LICENÇA
    const order = await this.prisma.order.create({
      data: {
        totalAmount: total,
        customerEmail: customerEmail,
        userId: userId, // VÍNCULO AO FK (User Logado)
        licenseKey: licenseKey, // SALVANDO A CHAVE
        status: OrderStatus.PENDING,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });

    // 3. MOCK DE ENTREGA E ENVIO DE E-MAIL
    if (order.status === OrderStatus.PENDING) {
      await this.handlePaymentSuccess(order.id);

      const completedOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } }
      });

      if (completedOrder && completedOrder.items.length > 0) {
        const firstItem = completedOrder.items[0];
        const productTitle = firstItem.product.name;

        // SECURITY: Using encrypted token instead of predictable key
        const downloadLink = this.getSecureDownloadUrl(
          completedOrder.id,
          firstItem.product.id
        );

        // CHAMA O SERVIÇO DE E-MAIL COM A CHAVE FINAL
        await this.emailService.sendDownloadLink(
          completedOrder.customerEmail || 'admin@havenn.com',
          downloadLink,
          completedOrder.id,
          productTitle,
          completedOrder.licenseKey || 'N/A' // Fallback de tipagem
        );
      }
    }

    return order;
  }

  // =========================================================================
  // 4. MÉTODOS DE BUSCA E CRUD
  // =========================================================================

  async findOrdersByEmail(email: string) {
    return await this.prisma.order.findMany({
      where: { customerEmail: email },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrders(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate secure download link with encrypted token
   * SECURITY: Replaced insecure key validation with cryptographic tokens
   */
  async generateDownloadLink(orderId: string, productId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.status !== 'PAID') throw new Error('Pedido não encontrado ou não pago.');

    const item = order.items.find(i => i.productId === productId);
    if (!item) throw new Error('Produto não faz parte deste pedido.');

    // SECURITY: Generate encrypted token with HMAC signature
    const downloadUrl = this.getSecureDownloadUrl(orderId, productId);

    return {
      downloadUrl: downloadUrl,
      fileName: `Havenn_Asset_${productId.substring(0, 8)}.zip`
    };
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  async updateStatus(orderId: string, status: 'PAID' | 'FAILED') {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // =========================================================================
  // 5. DASHBOARD STATS
  // =========================================================================

  async getDashboardStats() {
    // 1. Total Revenue (Only PAID orders)
    const paidOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PAID },
      select: { totalAmount: true }
    });

    const totalRevenue = paidOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

    // 2. Total Orders
    const totalOrders = await this.prisma.order.count();

    // 3. Recent Orders (Last 5)
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { name: true } } }
        },
        user: { select: { email: true } }
      }
    });

    return {
      totalRevenue,
      totalOrders,
      recentOrders
    };
  }
}