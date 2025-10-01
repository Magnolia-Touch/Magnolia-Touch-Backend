import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { OrderStatus } from '@prisma/client';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    return this.ordersService.findAll(req.user.id, pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  async getMyOrderById(@Req() req, @Param('id') id: string) {
    return this.ordersService.findOne(parseInt(id, 10), req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(":id/status")
  updateStatus(@Param('id') id: string, @Body() updatestatusdto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(+id, updatestatusdto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all-orders')
  async getMyOrdersByAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    return this.ordersService.findAllByAdmin(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all-orders/:id')
  async getMyOrderByIdByAdmin(@Req() req, @Param('id') id: string) {
    return this.ordersService.findOneByAdmin(parseInt(id, 10));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('memorial-orders')
  async getUserOrdersByAdmin(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
    @Query('createdDate') createdDate?: string,
    @Query('orderNumber') orderNumber?: string, // ✅ added
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    return this.ordersService.findUserOrdersByAdmin(
      req.user.id,
      pageNum,
      limitNum,
      status as OrderStatus,
      createdDate,
      orderNumber,
    );
  }

  @Patch(':id/tracking')
  async updateTracking(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingDto,
  ) {
    return this.ordersService.updateTracking(+id, dto);
  }

  @Patch(':id/mark-paid')
  async markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.markOrderAsPaid(id);
  }


}
