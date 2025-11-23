import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto, files: { file?: any[], image?: any[] }) {
    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let storageKey = 'default-file.zip';
    let imageUrl: string | null = null;

    // Salva o arquivo do produto
    if (files.file && files.file[0]) {
      const productFile = files.file[0];
      const fileName = `${Date.now()}-${productFile.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, productFile.buffer);
      storageKey = fileName;
    }

    // Salva a imagem do produto
    if (files.image && files.image[0]) {
      const imageFile = files.image[0];
      const imageName = `img-${Date.now()}-${imageFile.originalname}`;
      const imagePath = path.join(uploadDir, imageName);
      fs.writeFileSync(imagePath, imageFile.buffer);
      imageUrl = `/uploads/${imageName}`; // Caminho relativo para servir estático
    }

    return await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        details: createProductDto.details,
        category: createProductDto.category,
        videoUrl: createProductDto.videoUrl,
        price: createProductDto.price,
        storageKey: storageKey,
        imageUrl: imageUrl,
        isActive: true,
      },
    });
  }

  async findAll(search?: string, category?: string) {
    const conditions: any[] = [{ isActive: true }];

    if (category && category !== 'Todos') {
      conditions.push({ category });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { details: { contains: search } },
        ],
      });
    }

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