import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        details: createProductDto.details,
        category: createProductDto.category,
        videoUrl: createProductDto.videoUrl,
        price: createProductDto.price,
        storageKey: createProductDto.storageKey,
        isActive: true,

        
      },
    });
  }

async findAll(search?: string, category?: string) {
    // Inicia a lista de condições com "isActive: true"
    const conditions: any[] = [{ isActive: true }];

    // 1. Lógica de Categoria
    if (category && category !== 'Todos') {
      conditions.push({ category });
    }

    // 2. Lógica de Busca Inteligente (Nome OU Descrição OU Detalhes)
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },        // Procura no título
          { description: { contains: search } }, // Procura na descrição curta
          { details: { contains: search } },     // Procura no texto longo/técnico
        ],
      });
    }

    // Executa a query combinando tudo com AND (Ativo E Categoria E (Nome OU Descrição...))
    return await this.prisma.product.findMany({
      where: {
        AND: conditions,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

async findOne(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}