import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    return this.prisma.orders.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll() {
    return this.prisma.orders.findMany({
      include: { items: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.orders.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const { items, ...orderData } = updateOrderDto;

    return this.prisma.orders.update({
      where: { id },
      data: {
        ...orderData,
        items: items
          ? {
              deleteMany: {}, // clear old items
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async remove(id: number) {
    return this.prisma.orders.delete({
      where: { id },
    });
  }

  async updateStaus(id: number, updatestatusdto: UpdateOrderStatusDto) {
    return this.prisma.orders.update({
        where: { id },
        data : {
            status: updatestatusdto.status
        }
    })
  }

  /**
   * Update order status with optional notes - used by webhook service
   */
  async updateOrderStatus(id: number, updateData: { status?: OrderStatus; notes?: string }) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        status: updateData.status,
        notes: updateData.notes,
        updatedAt: new Date()
      },
      include: { items: true }
    });
  }
}
