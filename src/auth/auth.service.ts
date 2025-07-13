import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Flowers, Grave, Booking } from 'src/generated/prisma/';

const prisma = new PrismaClient()

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaClient,
    ){}


    async register(email: string, password: string, name: string, phone: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
        throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
        data: {
            // id: Date.now(), // Use a unique ID generator or UUID in production
            email,
            password: hashedPassword,
            customer_name: name,
            Phone: phone, // Provide a valid phone value or accept it as a parameter
        },
        });
        const token = this.jwtService.sign({ sub: user.customer_id, email: user.email,  });
        return { access_token: token, user: { id: user.customer_id, email: user.email } };
    }


    // LOGIN
    async login(identifier: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
            OR: [
                { email: identifier },
                { Phone: identifier },
            ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const token = this.jwtService.sign({
            sub: user.customer_id,
            email: user.email,
        });
        return {
            access_token: token,
            user: {
            id: user.customer_id,
            email: user.email,
            phone: user.Phone,
            },
        };
        }


    // LOGOUT
    async logout() {
        // With stateless JWT, logout is typically handled on the client side
        // Optionally, implement token blacklisting or use refresh tokens with a DB
        return { message: 'Logged out (client must delete token)' };
    }


    async getAllUsers() {
        return this.prisma.user.findMany();
    }


    async getUserById(id: number) {
        return this.prisma.user.findUnique({
            where: { customer_id: id },
        });
    }
}




