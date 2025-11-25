import { IsEmail, IsNotEmpty, IsArray, IsNumber, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// 1. O que é um Item dentro do Pedido
export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string; // Changed from id to productId for clarity and security

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

// 2. O que é o Pedido (Payload principal)
export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  // Total removed - calculated on server
  // total: number; 

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}