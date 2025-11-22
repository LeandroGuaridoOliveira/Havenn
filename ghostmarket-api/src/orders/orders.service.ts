// Importar o módulo CRYPTO para gerar a chave de licença única
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus } from '@prisma/client';
import { EmailService } from '../email/email.service'; // <-- Importado e Injetado
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // CONSTRUTOR: Injetando PrismaService e EmailService
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) { }

  // =========================================================================
  // MÉTODOS AUXILIARES E PRIVADOS
  // =========================================================================

  // MOCK: Simula a transição de PENDING para PAID (usada no create)
  private async handlePaymentSuccess(orderId: string) {
    this.logger.log(`Simulando webhook: Pedido ${orderId} atualizado para PAID.`);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });
  }

  // MÉTODO AUXILIAR: Gera o link de download temporário (chave e expiração)
  private getSecureDownloadUrl(orderId: string, productId: string, itemPrice: any): string {
    const priceString = itemPrice.toString();
    const uniqueKey = priceString + orderId.substring(0, 4);
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

    return `http://localhost:3000/download/secure/${productId}?key=${uniqueKey}&expires=${expirationTime}`;
  }

  // =========================================================================
  // 1. CRIAÇÃO DE PEDIDO (POST /orders)
  // =========================================================================

  async create(createOrderDto: CreateOrderDto) {
    const { items, total, customerEmail } = createOrderDto;

    // GERAÇÃO DA CHAVE DE LICENÇA ÚNICA (Anti-Pirataria)
    const licenseKey = crypto.randomUUID();

    const orderItemsData = items.map((item) => ({
      productId: item.id,
      price: item.price,
    }));

    const order = await this.prisma.order.create({
      data: {
        totalAmount: total,
        customerEmail: customerEmail || null,
        licenseKey: licenseKey, // SALVANDO A CHAVE
        status: OrderStatus.PENDING,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });

    // --- MOCK DE ENTREGA E ENVIO DE E-MAIL ---
    if (order.status === OrderStatus.PENDING) {
      // 1. Simula pagamento
      await this.handlePaymentSuccess(order.id);

      // 2. Busca o pedido completo e atualizado
      const completedOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } }
      });

      if (completedOrder && completedOrder.items.length > 0) {
        const firstItem = completedOrder.items[0];
        const productTitle = firstItem.product.name;

        // 3. Gera o link e envia o e-mail
        const downloadLink = this.getSecureDownloadUrl(
          completedOrder.id,
          firstItem.product.id,
          firstItem.price
        );

        // CHAMA O SERVIÇO DE E-MAIL COM 5 ARGUMENTOS
        await this.emailService.sendDownloadLink(
          completedOrder.customerEmail || 'admin@havenn.com',
          downloadLink,
          completedOrder.id,
          productTitle,
          completedOrder.licenseKey || '' // CHAVE FINAL DE LICENÇA
        );
      }
    }

    return order;
  }

  // =========================================================================
  // 2. BUSCA POR E-MAIL (Dashboard do Cliente)
  // =========================================================================

  async findOrdersByEmail(email: string) {
    return await this.prisma.order.findMany({
      where: { customerEmail: email },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================================================================
  // 3. GERAÇÃO DE DOWNLOAD (Rota Protegida)
  // =========================================================================

  async generateDownloadLink(orderId: string, productId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.status !== 'PAID') throw new Error('Pedido não encontrado ou não pago.');

    const item = order.items.find(i => i.productId === productId);
    if (!item) throw new Error('Produto não faz parte deste pedido.');

    const downloadUrl = this.getSecureDownloadUrl(orderId, productId, item.price);

    return {
      downloadUrl: downloadUrl,
      fileName: `Havenn_Asset_${productId.substring(0, 8)}.zip`
    };
  }

  // =========================================================================
  // 4. MÉTODOS CRUD PADRÃO
  // =========================================================================

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
}