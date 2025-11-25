import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { DownloadService } from '../download/download.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockEmailService = {};
  const mockDownloadService = {
    generateToken: jest.fn().mockReturnValue('mock-token'),
  };
  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3333'),
  };
  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: DownloadService, useValue: mockDownloadService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getQueueToken('email'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if a product is not found', async () => {
      const createOrderDto = {
        customerEmail: 'test@example.com',
        items: [{ productId: 'invalid-id', quantity: 1 }],
      };

      jest.spyOn(prisma.product, 'findMany').mockResolvedValue([]);

      await expect(service.create(createOrderDto as any, 'user-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
