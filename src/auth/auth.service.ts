import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private userService: UserService
    ) {}

    async register(registerDto: RegisterDto) {
        const { email, password, customer_name, Phone } = registerDto;
        const existingUser = await this.prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return {
                message: "User already exists",
                data: null,
                status: HttpStatus.CONFLICT
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.createUser({
            email,
            password: hashedPassword,
            customer_name,
            Phone,
            role: Role.USER
        });

        const token = this.jwtService.sign({
            sub: user.customer_id,
            name: user.customer_name,
            email: user.email,
            phone: user.Phone,
            role: user.role,
        });

        return {
            message: 'User registered successfully',
            data: {
                access_token: token,
                user: {
                    id: user.customer_id,
                    name: user.customer_name,
                    email: user.email,
                    phone: user.Phone,
                    role: user.role,
                },
            },
            status: HttpStatus.CREATED,
        };
    }

    async adminregister(registerDto: RegisterDto) {
        const { email, password, customer_name, Phone } = registerDto;
        const existingUser = await this.prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return {
                message: "User already exists",
                data: null,
                status: HttpStatus.CONFLICT
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.createUser({
            email,
            password: hashedPassword,
            customer_name,
            Phone,
            role: Role.ADMIN
        });

        const token = this.jwtService.sign({
            sub: user.customer_id,
            name: user.customer_name,
            email: user.email,
            phone: user.Phone,
            role: user.role,
        });

        return {
            message: 'Admin registered successfully',
            data: {
                access_token: token,
                user: {
                    id: user.customer_id,
                    name: user.customer_name,
                    email: user.email,
                    phone: user.Phone,
                    role: user.role,
                },
            },
            status: HttpStatus.CREATED,
        };
    }

    async login(identifier: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { Phone: identifier },
                ],
            },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return {
                message: 'Invalid credentials',
                data: null,
                status: HttpStatus.UNAUTHORIZED,
            };
        }

        const token = this.jwtService.sign({
            sub: user.customer_id,
            email: user.email,
            phone: user.Phone,
            role: user.role,
        });

        return {
            message: 'Login successful',
            data: {
                access_token: token,
                user: {
                    id: user.customer_id,
                    email: user.email,
                    phone: user.Phone,
                    name: user.customer_name,
                    role: user.role,
                },
            },
            status: HttpStatus.OK,
        };
    }

    async logout() {
        return {
            message: 'Logged out (client must delete token)',
            data: null,
            status: HttpStatus.OK,
        };
    }

    async getAllUsers() {
        const users = await this.prisma.user.findMany();
        return {
            message: 'All users fetched successfully',
            data: users,
            status: HttpStatus.OK,
        };
    }

    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
        });

        if (!user) {
            return {
                message: 'User not found',
                data: null,
                status: HttpStatus.NOT_FOUND,
            };
        }

        return {
            message: 'User fetched successfully',
            data: user,
            status: HttpStatus.OK,
        };
    }
}
