// src/utils/revenue.utils.ts
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

@Injectable()
export class RevenueUtils {
  constructor(private prisma: PrismaService) {}

  // Cleaning Service Revenue (unique by bkng_parent_id)
  async getCleaningServiceRevenue(start: Date, end: Date) {
    // Step 1: group by parent & date
    const grouped = await this.prisma.booking.groupBy({
      by: ['bkng_parent_id', 'booking_date'],
      _sum: { totalAmount: true },
      where: {
        booking_date: { gte: start, lte: end },
        bkng_parent_id: { not: null },
      },
    });

    // Step 2: collapse to unique dates
    const revenueByDate = new Map<string, number>();

    grouped.forEach((r) => {
      const dateKey = r.booking_date.toISOString().split('T')[0]; // YYYY-MM-DD
      const current = revenueByDate.get(dateKey) || 0;
      revenueByDate.set(dateKey, current + Number(r._sum.totalAmount || 0));
    });

    // Step 3: return as array
    return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date: new Date(date),
      revenue,
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

    return result.map((r) => ({
      date: r.createdAt,
      revenue: Number(r._sum.totalAmount || 0),
    }));
  }
}
