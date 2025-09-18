import { Controller, Post, Get, Body, Param, UseGuards, Request, Req, Patch } from '@nestjs/common';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { PrismaClient } from '@prisma/client/scripts/default-index';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private userservice: UserService) { }
  //User Address Controller
  @UseGuards(JwtAuthGuard)
  @Post('create-user-address')
  createDeliAddrs(@Body() dto: CreateUserAddressDto, @Request() req) {
    const user = req.user.customer_id
    return this.userservice.createDeliAddrs(dto, user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('get-user-address')
  getAllDeliAddrs(@Request() req) {
    const user = req.user.customer_id
    return this.userservice.getAllDeliAddrs(user);
  }


  //User Billing Address Controller
  @UseGuards(JwtAuthGuard)
  @Post('create-bill-address')
  createBillAddrs(@Body() dto: CreateBillingAddressDto, @Request() req) {
    const user = req.user.customer_id
    return this.userservice.createBillAddrs(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getall-bill-address')
  getAllBillAddr(@Request() req) {
    const user = req.user.customer_id
    return this.userservice.getAllBillAddr(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-active-subscriptions')
  getActiveSubscription(@Request() req) {
    const user = req.user.customer_id
    return this.userservice.getActiveSubscription(user);
  }




}