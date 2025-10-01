// src/utils/revenue.utils.ts
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class RevenueUtils {
    constructor(private prisma: PrismaService) { }

    // Cleaning Service Revenue
    async getCleaningServiceRevenue(start: Date, end: Date) {
        const result = await this.prisma.booking.groupBy({
            by: ['booking_date'],
            _sum: { totalAmount: true },
            where: {
                booking_date: { gte: start, lte: end },
            },
        });

        return result.map(r => ({
            date: r.booking_date,
            revenue: Number(r._sum.totalAmount || 0),
        }));
    }

    // Memorial Revenue
    async getMemorialRevenue(start: Date, end: Date) {
        const result = await this.prisma.orders.groupBy({
            by: ['createdAt'],
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: start, lte: end },
                is_paid: true,
            },
        });

        return result.map(r => ({
            date: r.createdAt,
            revenue: Number(r._sum.totalAmount || 0),
        }));
    }
}
