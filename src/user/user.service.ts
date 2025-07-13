import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: {email: string; password: string; customer_name: string; Phone: string }) {
    return await this.prisma.user.create({ data: {
      customer_name: data.customer_name,
      email: data.email,
      password: data.password,
      Phone: data.Phone
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
    // Password validation logic (e.g., bcrypt.compare)
    if (user && user.password === password) {
      return user; // Or return some safe object
    }
    return null;
  }

}
