import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 1. CRIAÇÃO DE PEDIDO (CHECKOUT)
  async create(createOrderDto: any) {
    const { items, total } = createOrderDto;

    // Cria o pedido e os OrderItems em uma única transação
    return await this.prisma.order.create({
      data: {
        totalAmount: total,
        status: 'PENDING', 
        items: {
          create: items.map((item) => ({
            productId: item.id,
            price: item.price,
          })),
        },
      },
      include: { items: true},
    });
  }

  // 2. BUSCA TODOS OS PEDIDOS
  async findAll() {
    return await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. BUSCA UM ÚNICO PEDIDO
  async findOne(id: string) {
    return await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  // 4. GERAÇÃO DE LINK DE DOWNLOAD SEGURO
  async generateDownloadLink(orderId: string, productId: string) {
    // 1. Verificar Status do Pagamento
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Pedido não encontrado.');
    }
    
    // Futuro: Se o status for PENDING/FAILED, deve falhar
    if (order.status !== 'PENDING' && order.status !== 'PAID') { 
      throw new Error('Pagamento pendente ou falho.');
    }
    
    // 2. Verificar se o Produto Pertence ao Pedido
    const item = order.items.find(i => i.productId === productId);
    if (!item) {
      throw new Error('Produto não faz parte deste pedido.');
    }

    // 3. Simulação de URL Assinada
    const uniqueKey = item.price.toString() + orderId.substring(0, 4);
    const tempUrl = `http://localhost:3000/download/secure/${item.productId}?key=${uniqueKey}&expires=${Date.now() + 3600000}`; 

    return { 
      downloadUrl: tempUrl,
      fileName: `Havenn_Asset_${item.productId.substring(0, 8)}.zip`
    };
  }
  // Adicione este novo método no final da classe OrdersService
async updateStatus(orderId: string, status: 'PAID' | 'FAILED') {
  return await this.prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

async findOrdersByEmail(email: string) {
  return await this.prisma.order.findMany({
    where: { customerEmail: email },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

}