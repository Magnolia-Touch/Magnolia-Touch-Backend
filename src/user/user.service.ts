import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createuser.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  // user creation functions
  async createUser(dto: CreateUserDto) {
    const { email, password, customer_name, Phone, role } = dto;
    return await this.prisma.user.create({
      data: {
        customer_name: customer_name,
        email: email,
        password: password,
        Phone: Phone,
        role: role
      }
    });
  }


  async findUserByEmaiorphone(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }


  async updateUser(id: number, data: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { customer_id: id },
      data,
    });
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
    return this.prisma.userAddress.create({ data: { ...dto, userCustomer_id: user_id } });
  }


  async getAllDeliAddrs(user_id: number) {
    return this.prisma.userAddress.findMany({ where: { userCustomer_id: user_id } });
  }


  //User Billing Address Creation functions
  async createBillAddrs(dto: CreateBillingAddressDto, user_id: number) {
    return this.prisma.billingAddress.create({ data: { ...dto, userCustomer_id: user_id } });
  }


  async getAllBillAddr(user_id: number) {
    return this.prisma.billingAddress.findMany({ where: { userCustomer_id: user_id } });
  }

  async getActiveSubscription(user_id: number) {
    return this.prisma.booking.findMany({ where: { User_id: user_id } })
  }

  // ---------------- Delivery Address ----------------
  async getDeliAddrById(deli_address_id: number, user_id: number) {
    return this.prisma.userAddress.findFirst({
      where: { deli_address_id, userCustomer_id: user_id },
    });
  }

  // Update Delivery Address
  async updateDeliAddr(deli_address_id: number, dto: Partial<CreateUserAddressDto>, user_id: number) {
    const result = await this.prisma.userAddress.updateMany({
      where: { deli_address_id, userCustomer_id: user_id },
      data: dto,
    });

    if (result.count === 0) {
      return { success: false, message: 'Delivery address not found or not updated' };
    }

    const updated = await this.prisma.userAddress.findFirst({
      where: { deli_address_id, userCustomer_id: user_id },
    });

    return { success: true, message: 'Delivery address updated successfully', data: updated };
  }


  // Delete Delivery Address
  async deleteDeliAddr(deli_address_id: number, user_id: number) {
    const result = await this.prisma.userAddress.deleteMany({
      where: { deli_address_id, userCustomer_id: user_id },
    });

    if (result.count === 0) {
      return { success: false, message: 'Delivery address not found or already deleted' };
    }

    return { success: true, message: 'Delivery address deleted successfully' };
  }



  // ---------------- Billing Address ----------------
  async getBillAddrById(bill_address_id: number, user_id: number) {
    return this.prisma.billingAddress.findFirst({
      where: { bill_address_id, userCustomer_id: user_id },
    });
  }

  async updateBillAddr(bill_address_id: number, dto: Partial<CreateBillingAddressDto>, user_id: number) {
    const result = await this.prisma.billingAddress.updateMany({
      where: { bill_address_id, userCustomer_id: user_id },
      data: dto,
    });

    if (result.count === 0) {
      return { success: false, message: 'Billing address not found or not updated' };
    }

    const updated = await this.prisma.billingAddress.findFirst({
      where: { bill_address_id, userCustomer_id: user_id },
    });

    return { success: true, message: 'Billing address updated successfully', data: updated };
  }

  async deleteBillAddr(bill_address_id: number, user_id: number) {
    const result = await this.prisma.billingAddress.deleteMany({
      where: { bill_address_id, userCustomer_id: user_id },
    });

    if (result.count === 0) {
      return { success: false, message: 'Billing address not found or already deleted' };
    }

    return { success: true, message: 'Billing address deleted successfully' };
  }
}


