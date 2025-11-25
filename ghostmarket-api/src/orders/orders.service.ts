import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { DownloadService } from '../download/download.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private downloadService: DownloadService,
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
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
   */
  private getSecureDownloadUrl(orderId: string, productId: string): string {
    const token = this.downloadService.generateToken(orderId, productId);
    const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3333';
    return `${baseUrl}/download/secure/${productId}?token=${token}`;
  }

  // =========================================================================
  // 1. CRIAÇÃO DE PEDIDO (POST /orders)
  // =========================================================================

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const { items, customerEmail } = createOrderDto;

    // GERAÇÃO DA CHAVE DE LICENÇA ÚNICA
    const licenseKey = crypto.randomUUID();

    // 1. Fetch all products at once (Fix N+1)
    const productIds = items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Um ou mais produtos não foram encontrados.');
    }

    let calculatedTotal = new Prisma.Decimal(0);
    const orderItemsData: any[] = [];

    // 2. SERVER-SIDE PRICE CALCULATION (Fix Monetary Math)
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      // Use Decimal for precision: price * quantity
      const itemTotal = product.price.mul(item.quantity);
      calculatedTotal = calculatedTotal.add(itemTotal);

      orderItemsData.push({
        productId: product.id,
        price: product.price,
      });
    }

    // 3. CRIAÇÃO DA ORDEM COM FK E LICENÇA (Atomic Transaction)
    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          totalAmount: calculatedTotal,
          customerEmail: customerEmail,
          userId: userId,
          licenseKey: licenseKey,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: { include: { product: true } } },
      });
    });

    // 4. MOCK DE ENTREGA E ENVIO DE E-MAIL
    if (order.status === OrderStatus.PENDING) {
      await this.handlePaymentSuccess(order.id);

      const completedOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } }
      });

      if (completedOrder && completedOrder.items.length > 0) {
        const firstItem = completedOrder.items[0];
        const productTitle = firstItem.product.name;

        const downloadLink = this.getSecureDownloadUrl(
          completedOrder.id,
          firstItem.product.id
        );

        await this.emailQueue.add('send-link', {
          recipientEmail: completedOrder.customerEmail || 'admin@havenn.com',
          downloadLink,
          orderId: completedOrder.id,
          productTitle,
          licenseKey: completedOrder.licenseKey || 'N/A',
        });

        this.logger.log(`Job de e-mail adicionado à fila para o pedido ${completedOrder.id}`);
      }
    }

    return order;
  }

  // =========================================================================
  // 4. MÉTODOS DE BUSCA E CRUD
  // =========================================================================

  async findMyOrders(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateDownloadLink(orderId: string, productId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.status !== 'PAID') throw new BadRequestException('Pedido não encontrado ou não pago.');

    const item = order.items.find(i => i.productId === productId);
    if (!item) throw new BadRequestException('Produto não faz parte deste pedido.');

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
    const paidOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PAID },
      select: { totalAmount: true }
    });

    const totalRevenue = paidOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

    const totalOrders = await this.prisma.order.count();

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