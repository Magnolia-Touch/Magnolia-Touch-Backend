import { Injectable, UnauthorizedException, HttpStatus, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { PaginationQueryDto } from 'src/common/dto/paginationquery.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { use } from 'passport';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private userService: UserService,
        private emailService: MailerService
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

    async getAllUsers(query: { search?: string; page?: string; limit?: string }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        // Prisma where condition
        const where = search
            ? {
                OR: [
                    { customer_name: { contains: search, } },
                    { email: { contains: search, } },
                    { Phone: { contains: search, } },
                    {
                        Booking: {
                            some: {
                                subscription: {
                                    Subscription_name: { contains: search, },
                                },
                            },
                        },
                    },
                ],
            }
            : {};

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    customer_id: true,
                    customer_name: true,
                    email: true,
                    Phone: true,
                    role: true,
                    is_active: true,
                    createdAt: true,
                    updatedAt: true,
                    deadPersonProfiles: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profile_image: true,
                            born_date: true,
                            death_date: true,
                            memorial_place: true,
                            slug: true,
                        }
                    },
                    Booking: {
                        select: {
                            booking_ids: true,
                            name_on_memorial: true,
                            amount: true,
                            first_cleaning_date: true,
                            second_cleaning_date: true,
                            booking_date: true,
                            anniversary_date: true,
                            no_of_subscription_years: true,
                            status: true,
                            subscription: { select: { Subscription_name: true } },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
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
                customer_id: true,
                customer_name: true,
                email: true,
                Phone: true,
                role: true,
                is_active: true,
                createdAt: true,
                updatedAt: true,
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
                        slug: true,
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
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        let updateData = { customer_name: data.customer_name, Phone: data.Phone };
        const updatedUser = await this.prisma.user.update({
            where: { customer_id: id },
            data: updateData,
        });
        //need to exclude password from returned user object
        const { password, resetOtp, resetOtpExpiresAt, ...result } = updatedUser;
        return {
            message: 'User updated successfully',
            data: result,
            status: HttpStatus.OK,
        };
    }

    async updateUserActiveStatus(id: number, isActive: boolean) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const updatedUser = await this.prisma.user.update({
            where: { customer_id: id },
            data: { is_active: isActive }
        });
        //need to exclude password from returned user object
        const { password, resetOtp, resetOtpExpiresAt, ...result } = updatedUser;
        return {
            message: 'User active status updated successfully',
            data: result,
            status: HttpStatus.OK,
        };
    }


    async changePassword(userId: number, dto: ChangePasswordDto) {
        const { oldPassword, newPassword, confirmPassword } = dto;
        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }
        const user = await this.prisma.user.findUnique({ where: { customer_id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Old password is incorrect');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { customer_id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password changed successfully' };
    }

    async sendProfileOwnerNotification(ownerEmail: string, visitorName: string, profileName: string) {
        const subject = `New Memory Shared on ${profileName}`;
        await this.emailService.sendMail({
            to: ownerEmail,
            subject,
            template: "memoryNotification",
            context: {
                visitorName,
                profileName
            }
        });
    }

    // 1. Send OTP
    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new NotFoundException('User not found');
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await this.prisma.user.update({
            where: { email: dto.email },
            data: {
                resetOtp: otp,
                resetOtpExpiresAt: expiresAt,
            },
        });
        await this.emailService.sendMail({
            from: `"Magnolia Touch" <${process.env.MAIL_USER}>`,
            to: dto.email,
            subject: 'Password Reset OTP',
            template: "forgot_password",
            context: {
                otp
            }
        });
        return { message: 'OTP sent to email' };
    }

    // 2. Reset Password
    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
            throw new BadRequestException('Invalid request');
        }

        if (user.resetOtp !== dto.otp) {
            throw new BadRequestException('Invalid OTP');
        }

        if (user.resetOtpExpiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { email: dto.email },
            data: {
                password: hashedPassword,
                resetOtp: null,
                resetOtpExpiresAt: null,
            },
        });

        return { message: 'Password reset successful' };
    }

    async getUsersbyId(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id },
            select: {
                customer_id: true,
                customer_name: true,
                email: true,
                Phone: true,
                role: true,
                is_active: true,
                createdAt: true,
                updatedAt: true,
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
                        slug: true,
                        biography: true,
                        gallery: true,
                        family: true,
                        guestBook: true,
                        SocialLinks: true,
                        Events: true,

                    },
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

    async getAllBookingsOfUsers(id: number) {
        const bookings = await this.prisma.booking.findMany({
            where: { User_id: id },
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
        })

        return {
            data: bookings
        }
    }

    async getAllMemorialProfilesOfUsers(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id }
        })
        const memorialProfiles = await this.prisma.deadPersonProfile.findMany({
            where: { owner_id: user?.email },
            select: {
                firstName: true,
                lastName: true,
                profile_image: true,
                born_date: true,
                death_date: true,
                memorial_place: true,
                slug: true,
                biography: true,
                gallery: true,
                family: true,
                guestBook: true,
                SocialLinks: true,
                Events: true,

            },
        })
        return {
            data: memorialProfiles
        }
    }


    async getEachBookingsOfUsers(id: number, booking_id: string) {
        const bookings = await this.prisma.booking.findUnique({
            where: { User_id: id, booking_ids: booking_id },
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
        })

        return {
            data: bookings
        }
    }

    async getEachMemorialProfilesOfUsers(id: number, slug: string) {
        const user = await this.prisma.user.findUnique({
            where: { customer_id: id }
        })
        const memorialProfiles = await this.prisma.deadPersonProfile.findMany({
            where: { owner_id: user?.email, slug: slug },
            select: {
                firstName: true,
                lastName: true,
                profile_image: true,
                born_date: true,
                death_date: true,
                memorial_place: true,
                slug: true,
                biography: true,
                gallery: true,
                family: true,
                guestBook: true,
                SocialLinks: true,
                Events: true,

            },
        })
        return {
            data: memorialProfiles
        }
    }



}
