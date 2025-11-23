// Importar módulos necessários para criptografia e hash
import * as crypto from 'crypto'; 
import * as bcrypt from 'bcrypt'; 
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderStatus } from '@prisma/client'; 
import { EmailService } from '../email/email.service'; 
import { CreateOrderDto } from './dto/create-order.dto'; 

@Injectable()
export class OrdersService { 
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService, 
    private emailService: EmailService // <-- O serviço injetado
  ) {}

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

    // 1. Encontrar ou Criar Usuário (Para vincular o pedido ao FK)
    let user = await this.prisma.user.findUnique({ where: { email: customerEmail } });

    if (!user) {
        // Cria usuário se não existir
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        user = await this.prisma.user.create({
            data: {
                email: customerEmail,
                password: hashedPassword,
                role: 'CUSTOMER',
            }
        });
        this.logger.log(`Novo usuário CUSTOMER criado: ${user.email}`);
    }

    const orderItemsData = items.map((item) => ({
      productId: item.id,
      price: item.price,
    }));
    
    // 2. CRIAÇÃO DA ORDEM COM FK E LICENÇA
    const order = await this.prisma.order.create({
      data: {
        totalAmount: total,
        customerEmail: customerEmail,
        userId: user.id, // VÍNCULO AO FK
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
            
            const downloadLink = this.getSecureDownloadUrl(
                completedOrder.id, 
                firstItem.product.id, 
                firstItem.price 
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