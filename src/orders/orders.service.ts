import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch paginated + latest first
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        where: { User_id: userId },
        orderBy: { createdAt: 'desc' }, // latest first
        skip,
        take: limit,
      }),
      this.prisma.orders.count({ where: { User_id: userId } }),
    ]);

    return {
      message: 'Orders fetched successfully',
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }


  async findOne(id: number, userId: number) {
    const order = await this.prisma.orders.findFirst({
      where: { id, User_id: userId }, // must match both id and User_id
    });

    if (!order) {
      throw new NotFoundException(`No order found with ID ${id} for this user`);
    }

    return order;
  }


  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        ...updateOrderDto,
      },
    });
  }

  //ADMIN ONLY
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

  async findAllByAdmin(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch paginated + latest first
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        orderBy: { createdAt: 'desc' }, // latest first
        skip,
        take: limit,
      }),
      this.prisma.orders.count(), // total orders, no user filter
    ]);

    return {
      message: 'Orders fetched successfully',
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }



  async findOneByAdmin(id: number) {
    const order = await this.prisma.orders.findFirst({
      where: { id }, // must match both id and User_id
    });
    if (!order) {
      throw new NotFoundException(`No order found with ID ${id} for this user`);
    }
    return order;
  }
}
