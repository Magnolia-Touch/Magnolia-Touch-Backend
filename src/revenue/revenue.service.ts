// src/revenue/revenue.service.ts
import { Injectable } from '@nestjs/common';
import { RevenueUtils } from './revenue.utils';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

type RevenuePoint = {
    date: Date;
    revenue: number;
};

@Injectable()
export class RevenueService {
    constructor(private readonly revenueUtils: RevenueUtils) { }

    async getRevenue(
        filterType: string,
        service: string,
        startDate?: string,
        endDate?: string,
    ) {
        let start: Date;
        let end: Date;

        const now = new Date();

        switch (filterType) {
            case 'month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case 'year':
                start = startOfYear(now);
                end = endOfYear(now);
                break;
            case 'range':
                if (!startDate || !endDate) throw new Error('Date range required');
                start = new Date(startDate);
                end = new Date(endDate);

                // Check if range exceeds 30 days
                const diffTime = end.getTime() - start.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays > 30) {
                    throw new Error('Date range cannot exceed 30 days');
                }
                break;

            default: // normal → group by each month
                start = startOfYear(now);
                end = endOfYear(now);
        }

        // ✅ Explicitly typed arrays
        let cleaningRevenue: RevenuePoint[] = [];
        let memorialRevenue: RevenuePoint[] = [];

        if (service === 'cleaning' || service === 'all') {
            cleaningRevenue = await this.revenueUtils.getCleaningServiceRevenue(start, end);
        }
        if (service === 'memorial' || service === 'all') {
            memorialRevenue = await this.revenueUtils.getMemorialRevenue(start, end);
        }

        // ✅ Explicit typing for chartjs data
        const labels: string[] = [];
        const cleaningData: number[] = [];
        const memorialData: number[] = [];

        if (filterType === 'month') {
            // daily revenue of this month
            const days = Array.from(
                { length: end.getDate() - start.getDate() + 1 },
                (_, i) => new Date(start.getFullYear(), start.getMonth(), i + 1),
            );

            days.forEach(day => {
                labels.push(day.toLocaleDateString());
                cleaningData.push(
                    cleaningRevenue.find(r => r.date.toDateString() === day.toDateString())?.revenue || 0,
                );
                memorialData.push(
                    memorialRevenue.find(r => r.date.toDateString() === day.toDateString())?.revenue || 0,
                );
            });
        } else if (filterType === 'year' || filterType === 'normal') {
            // monthly revenue
            for (let m = 0; m < 12; m++) {
                labels.push(new Date(0, m).toLocaleString('default', { month: 'short' }));
                const monthClean = cleaningRevenue
                    .filter(r => r.date.getMonth() === m)
                    .reduce((sum, r) => sum + r.revenue, 0);
                const monthMemorial = memorialRevenue
                    .filter(r => r.date.getMonth() === m)
                    .reduce((sum, r) => sum + r.revenue, 0);

                cleaningData.push(monthClean);
                memorialData.push(monthMemorial);
            }
        } else {
            // custom range → daily
            const rangeDays: Date[] = [];
            let cur = new Date(start);
            while (cur <= end) {
                rangeDays.push(new Date(cur));
                cur.setDate(cur.getDate() + 1);
            }

            rangeDays.forEach(day => {
                labels.push(day.toLocaleDateString());
                cleaningData.push(
                    cleaningRevenue.find(r => r.date.toDateString() === day.toDateString())?.revenue || 0,
                );
                memorialData.push(
                    memorialRevenue.find(r => r.date.toDateString() === day.toDateString())?.revenue || 0,
                );
            });
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Cleaning Service Revenue',
                    data: cleaningData,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                },
                {
                    label: 'Memorial Revenue',
                    data: memorialData,
                    borderColor: 'rgba(153,102,255,1)',
                    backgroundColor: 'rgba(153,102,255,0.2)',
                },
            ],
        };
    }
}
