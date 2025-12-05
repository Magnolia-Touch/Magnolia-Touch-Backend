import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { PrismaClient } from '@prisma/client/scripts/default-index';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userservice: UserService) {}
  //User Address Controller
  @UseGuards(JwtAuthGuard)
  @Post('create-user-address')
  createDeliAddrs(@Body() dto: CreateUserAddressDto, @Request() req) {
    const user = req.user.customer_id;
    return this.userservice.createDeliAddrs(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user-address')
  getAllDeliAddrs(@Request() req) {
    const user = req.user.customer_id;
    return this.userservice.getAllDeliAddrs(user);
  }

  //User Billing Address Controller
  @UseGuards(JwtAuthGuard)
  @Post('create-bill-address')
  createBillAddrs(@Body() dto: CreateBillingAddressDto, @Request() req) {
    const user = req.user.customer_id;
    return this.userservice.createBillAddrs(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getall-bill-address')
  getAllBillAddr(@Request() req) {
    const user = req.user.customer_id;
    return this.userservice.getAllBillAddr(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-active-subscriptions')
  getActiveSubscription(@Request() req) {
    const user = req.user.customer_id;
    return this.userservice.getActiveSubscription(user);
  }

  // ---------------- Delivery Address ----------------
  @UseGuards(JwtAuthGuard)
  @Get('get-user-address/:deli_address_id')
  getDeliAddrById(
    @Param('deli_address_id') deli_address_id: string,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.getDeliAddrById(Number(deli_address_id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-user-address/:deli_address_id')
  updateDeliAddr(
    @Param('deli_address_id') deli_address_id: string,
    @Body() dto: Partial<CreateUserAddressDto>,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.updateDeliAddr(Number(deli_address_id), dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-user-address/:deli_address_id')
  deleteDeliAddr(
    @Param('deli_address_id') deli_address_id: string,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.deleteDeliAddr(Number(deli_address_id), user);
  }

  // ---------------- Billing Address ----------------
  @UseGuards(JwtAuthGuard)
  @Get('get-bill-address/:bill_address_id')
  getBillAddrById(
    @Param('bill_address_id') bill_address_id: string,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.getBillAddrById(Number(bill_address_id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-bill-address/:bill_address_id')
  updateBillAddr(
    @Param('bill_address_id') bill_address_id: string,
    @Body() dto: Partial<CreateBillingAddressDto>,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.updateBillAddr(Number(bill_address_id), dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-bill-address/:bill_address_id')
  deleteBillAddr(
    @Param('bill_address_id') bill_address_id: string,
    @Request() req,
  ) {
    const user = req.user.customer_id;
    return this.userservice.deleteBillAddr(Number(bill_address_id), user);
  }
}
