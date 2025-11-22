// Importe estes módulos se ainda não tiver feito: npm install class-validator class-transformer
import { IsEmail, IsNotEmpty, IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. O que é um Item dentro do Pedido
export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  id: string; // Product ID

  @IsNotEmpty()
  @IsNumber()
  price: number; // Price snapshot
}

// 2. O que é o Pedido (Payload principal)
export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty() // Tornamos obrigatório agora que o Frontend coleta o dado
  customerEmail: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}