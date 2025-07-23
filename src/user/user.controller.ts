import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { PrismaClient } from '@prisma/client/scripts/default-index';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private userservice: UserService) {}
  //User Address Controller
  @Post('create-user-address')
  createDeliAddrs(@Body() dto: CreateUserAddressDto) {
    return this.userservice.createDeliAddrs(dto);
  }


  @Get('get-all-address')
  getAllDeliAddrs() {
    return this.userservice.getAllDeliAddrs();
  }


  //User Billing Address Controller
  @Post('create-bill-address')
  createBillAddrs(@Body() dto: CreateBillingAddressDto) {
    return this.userservice.createBillAddrs(dto);
  }

  @Get('getall-bill-address')
  getAllBillAddr() {
    return this.userservice.getAllBillAddr();
  }
}