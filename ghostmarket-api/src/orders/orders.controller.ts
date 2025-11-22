import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus,HttpException, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  // --- BUSCA GERAL (GET /orders) ---
  @Get()
  @UseGuards(JwtAuthGuard) 
  findAll() {
    return this.ordersService.findAll();
  }

  // --- BUSCA POR ID ESPECÍFICO (GET /orders/:id) ---
  // Esta rota dinâmica deve ser tratada ANTES das rotas de lookup por string.
  @Get(':id')
  @UseGuards(JwtAuthGuard) 
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // --- BUSCA POR EMAIL (GET /orders/email/:email) ---
  // Rota de consulta para o cliente (com nome fixo para evitar conflito com o ID)
  @Get('email/:email') 
  async findOrdersByEmail(@Param('email') email: string) {
    return this.ordersService.findOrdersByEmail(email);
  }

  // --- DOWNLOAD LINK (GET /orders/:orderId/download/:productId) ---
  @Get(':orderId/download/:productId')
  @UseGuards(JwtAuthGuard) 
  async getDownloadLink(
    @Param('orderId') orderId: string,
    @Param('productId') productId: string
  ) {
    return this.ordersService.generateDownloadLink(orderId, productId);
  }

  // --- WEBHOOK MOCK (PATCH /orders/:orderId/status) ---
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
}