import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.orders.create({
      data: {
        ...createOrderDto,
        memoryProfileId: createOrderDto.memoryProfileId,
      },
    });
  }

  async findAll() {
    return this.prisma.orders.findMany();
  }

  async findOne(id: number) {
    return this.prisma.orders.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        ...updateOrderDto,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.orders.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, updatestatusdto: UpdateOrderStatusDto) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        status: updatestatusdto.status,
      },
    });
  }

  /**
   * Update order status with optional notes - used by webhook service
   */
  async updateOrderStatus(
    id: number,
    updateData: { status?: OrderStatus; notes?: string },
  ) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        status: updateData.status,
        notes: updateData.notes,
        updatedAt: new Date(),
      },
    });
  }
}
