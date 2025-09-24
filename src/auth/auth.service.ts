import { Injectable, UnauthorizedException, HttpStatus, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { PaginationQueryDto } from 'src/common/dto/paginationquery.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private userService: UserService
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, customer_name, Phone } = registerDto;
        const existingUser = await this.prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new ConflictException('User already exists');
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
            throw new ConflictException('User already exists');
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
            throw new UnauthorizedException('Invalid credentials');
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

    async getAllUsers(query: PaginationQueryDto = { page: 1, limit: 10 }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    email: true,
                    customer_name: true,
                    Phone: true,
                    // deadPersonProfiles: true,
                    // Booking: true
                    // ❌ password intentionally omitted
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }


    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
        });

        if (!user) {
            return {
                throw: new UnauthorizedException('User not found'),
            };
        }

        return {
            message: 'User fetched successfully',
            data: user,
            status: HttpStatus.OK,
        };
    }

    async userProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: userId },
            select: {
                customer_name: true,
                email: true,
                Phone: true,
                Booking: {
                    select: {
                        booking_ids: true,
                        name_on_memorial: true,
                        plot_no: true,
                        amount: true,
                        first_cleaning_date: true,
                        second_cleaning_date: true,
                        booking_date: true,
                        anniversary_date: true,
                        no_of_subscription_years: true,
                        status: true,
                        Church: {
                            select: {
                                church_name: true,
                            },
                        },
                        flower: {
                            select: {
                                Name: true
                            }
                        },
                        subscription: {
                            select: {
                                Subscription_name: true,
                                Price: true,
                            }
                        }
                    }
                },
                deadPersonProfiles: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profile_image: true,
                        born_date: true,
                        death_date: true,
                        memorial_place: true,
                    }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            message: 'User profile fetched successfully',
            data: user,
            status: HttpStatus.OK,
        };
    }



    async updateUser(id: number, data: UpdateUserDto) {
        // 1. Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // 2. Hash password if present
        let updateData = { ...data };
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            updateData.password = hashedPassword;
        }

        // 3. Perform update
        return this.prisma.user.update({
            where: { customer_id: id },
            data: updateData,
        });
    }

}
