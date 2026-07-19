import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleServiceError } from 'src/common/utils';
import { buildActiveBookingFilter, getBookingsCountQuery, getCancelledBookingsCountQuery, getTopSpacesQuery, getTotalRevenueQuery } from './utils/reports-db.util';
import { GetReportQueryDto } from './dto/get-report-query.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name)

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(take: number, query: GetReportQueryDto) {
    const { to, from } = query

    try {
      const activeFilter = buildActiveBookingFilter(from, to)

      const [revenueResult, totalBookings, topSpacesRaw, cancelledBookings] = await this.prisma.$transaction([
        getTotalRevenueQuery(this.prisma, activeFilter),
        getBookingsCountQuery(this.prisma, activeFilter),
        getTopSpacesQuery(this.prisma, activeFilter, take),
        getCancelledBookingsCountQuery(this.prisma, from, to)
      ])

      const totalRevenue = revenueResult._sum.totalCost || 0

      const spaceIds = topSpacesRaw.map((item) => item.spaceId)
      const spacesInfo = await this.prisma.space.findMany({
        where: { id: { in: spaceIds } },
        select: { id: true, name: true, type: true, pricePerHour: true }
      })

      const topSpaces = topSpacesRaw.map((raw) => {
        const space = spacesInfo.find((s) => s.id === raw.spaceId)

        return {
          spaceId: raw.spaceId,
          name: space?.name || "Удаленное пространство",
          type: space?.type || "UNKNOWN",
          pricePerHour: space?.pricePerHour || 0,
          bookingsCount: raw._count.id,
          revenueGenerated: raw._sum.totalCost || 0
        }
      })

      const averageCheck = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0

      return {
        period: { from: from || "Начало времен", to: to || "Текущий момент" },
        overview: { totalRevenue, totalBookings, cancelledBookings, averageCheck },
        topSpaces: topSpaces
      }
    } catch (err: any) {
      handleServiceError(err, this.logger, "Ошибка при генерации аналитического отчета")
    }
  }
}
