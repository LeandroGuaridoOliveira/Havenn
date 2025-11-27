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
    const filesDir = path.join(uploadDir, 'files');
    const imagesDir = path.join(uploadDir, 'images');

    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    let storageKey = 'default-file.zip';
    let imageUrl: string | null = null;

    // Salva o arquivo do produto (Privado)
    if (files.file && files.file[0]) {
      const productFile = files.file[0];
      const fileName = `${Date.now()}-${productFile.originalname}`;
      const filePath = path.join(filesDir, fileName);
      fs.writeFileSync(filePath, productFile.buffer);
      storageKey = fileName;
    }

    // Salva a imagem do produto (Público)
    if (files.image && files.image[0]) {
      const imageFile = files.image[0];
      const imageName = `img-${Date.now()}-${imageFile.originalname}`;
      const imagePath = path.join(imagesDir, imageName);
      fs.writeFileSync(imagePath, imageFile.buffer);
      imageUrl = `/uploads/images/${imageName}`; // Caminho público
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
        modules: createProductDto.modules ? {
          create: createProductDto.modules.map(module => ({
            title: module.title,
            order: module.order,
            lessons: {
              create: module.lessons.map(lesson => ({
                title: lesson.title,
                videoUrl: lesson.videoUrl,
                description: lesson.description,
                order: lesson.order,
              }))
            }
          }))
        } : undefined,
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
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
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}