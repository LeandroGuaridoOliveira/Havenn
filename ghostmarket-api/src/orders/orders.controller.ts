import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus, UseGuards, HttpException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Guarda de Segurança
import { CreateOrderDto } from './dto/create-order.dto'; 

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================================================================
  // 1. CRIAÇÃO DE PEDIDO (POST /orders)
  // Requer token JWT para criar o pedido (enviado pelo CartDrawer)
  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // =========================================================================
  // 2. BUSCA GERAL (GET /orders) - Admin Use
  @UseGuards(JwtAuthGuard) 
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // =========================================================================
  // 3. BUSCA POR ID ESPECÍFICO (GET /orders/:id) - Admin Use
  @UseGuards(JwtAuthGuard) 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // =========================================================================
  // 4. ATUALIZAÇÃO DE STATUS (PATCH /orders/:orderId/status) - Webhook Mock
  // Requer token JWT para simular o pagamento (uso exclusivo do sistema).
  @UseGuards(JwtAuthGuard)
  @Patch(':orderId/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('orderId') orderId: string, 
    @Body('status') status: 'PAID' | 'FAILED'
  ) {
    if (status !== 'PAID' && status !== 'FAILED') {
      throw new HttpException('Status inválido.', HttpStatus.BAD_REQUEST);
    }
    return this.ordersService.updateStatus(orderId, status);
  }

  // =========================================================================
  // 5. DOWNLOAD SEGURO (GET /orders/:orderId/download/:productId)
  // Protege a geração do link temporário.
  @UseGuards(JwtAuthGuard) 
  @Get(':orderId/download/:productId')
  async getDownloadLink(
    @Param('orderId') orderId: string,
    @Param('productId') productId: string
  ) {
    return this.ordersService.generateDownloadLink(orderId, productId);
  }

  // =========================================================================
  // 6. BUSCA POR E-MAIL (GET /orders/email/:email) - Customer Lookup
  // Não é protegida, pois o e-mail é a chave pública de consulta do cliente.
  @Get('email/:email') 
  async findOrdersByEmail(@Param('email') email: string) {
    return this.ordersService.findOrdersByEmail(email);
  }
}