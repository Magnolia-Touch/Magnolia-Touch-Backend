import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createuser.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // user creation functions
  async createUser(dto: CreateUserDto) {
    const { email, password, customer_name, Phone, role } = dto;
    return await this.prisma.user.create({ data: {
      customer_name: customer_name,
      email: email,
      password: password,
      Phone: Phone,
      role: role
    } });
  }


  async findUserByEmaiorphone(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }


  async updateUser(
    id: number,
    data: Partial<{ name: string; email: string; password: string }>
  ) {
    return await this.prisma.user.update({ where: { customer_id: id }, data });
  }


  async deleteUser(id: number) {
    return await this.prisma.user.delete({ where: { customer_id: id } });
  }


  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user && user.password === password) {
      return user; // Or return some safe object
    }
    return null;
  }


  // User delivery Address Creation function
  async createDeliAddrs(dto: CreateUserAddressDto, user_id: number) {
    return this.prisma.userAddress.create({ data:{...dto, userCustomer_id: user_id} });
  }


  async getAllDeliAddrs(user_id: number) {
    return this.prisma.userAddress.findMany({where: { userCustomer_id: user_id }});
  }


  //User Billing Address Creation functions
  async createBillAddrs(dto: CreateBillingAddressDto, user_id: number) {
    return this.prisma.billingAddress.create({ data:{...dto, userCustomer_id: user_id}});
  }


  async getAllBillAddr(user_id: number) {
    return this.prisma.billingAddress.findMany({where: { userCustomer_id: user_id }});
  }

  
}
