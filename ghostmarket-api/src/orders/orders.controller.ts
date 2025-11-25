import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus, UseGuards, HttpException, Request, Headers, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // =========================================================================
  // 1. CRIAÇÃO DE PEDIDO (POST /orders)
  // Requer token JWT para criar o pedido (enviado pelo CartDrawer)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(createOrderDto, req.user.sub);
  }

  // =========================================================================
  // 1.1. MEUS PEDIDOS (GET /orders/my-orders) - Customer Use
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findMyOrders(@Request() req: any) {
    return this.ordersService.findMyOrders(req.user.sub);
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
  // 4.1. WEBHOOK REAL (POST /orders/webhook)
  // Endpoint para receber notificações do Gateway de Pagamento (ex: Stripe)
  // =========================================================================
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() event: any
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // TODO: Validar a assinatura real usando a chave secreta do Stripe
    // const isValid = stripe.webhooks.constructEvent(event, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // if (!isValid) throw new BadRequestException('Invalid signature');

    console.log('Webhook received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const orderId = event.data.object.metadata.orderId;
      await this.ordersService.updateStatus(orderId, 'PAID');
    }

    return { received: true };
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
  // 6. DASHBOARD STATS (GET /orders/stats) - Admin Only
  // =========================================================================
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.ordersService.getDashboardStats();
  }
}