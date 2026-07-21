import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { BookingStatus, Prisma } from "@prisma/client";
import { FilterBookingDto } from "../dto/filter-booking.dto";

export async function checkSpaceAvailability(
    tx: Prisma.TransactionClient,
    spaceId: string
) {
    const space = await tx.space.findUnique({ where: { id: spaceId } })
    if (!space || !space.isActive) {
        throw new BadRequestException("Пространство не найдено или недоступно для бронирования")
    }

    return space
}

export async function checkOverlappingBookings(
    tx: Prisma.TransactionClient,
    spaceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
) {
    const overlapping = await tx.booking.findFirst({
        where: {
            spaceId,
            status: { in: [BookingStatus.PENDING, BookingStatus.ACTIVE] },
            ...(excludeBookingId && { id: { not: excludeBookingId } }),
            AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }]
        }
    })

    if (overlapping) {
        throw new ConflictException("На выбранное время это пространство уже забронировано")
    }
}

export async function deductUserBalance(
    tx: Prisma.TransactionClient,
    userId: string,
    cost: number
) {
    const user = await tx.user.findUnique({ where: { id: userId } })
    
    if (!user || !user.isActive) {
        throw new ForbiddenException("Ваш аккаунт декактивирован. Бронирование и списание недоступно")
    }

    if (!user || user.balance < cost) {
        throw new BadRequestException(`Недостаточно балов. Требуется: ${cost}, у вас: ${user?.balance || 0}`)
    }

    await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: cost } }
    })
}

export async function getValidBookingForMutation(
    tx: Prisma.TransactionClient,
    bookingId: string,
    userId: string
) {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } })

    if (!booking) {
        throw new NotFoundException("Бронирование не найдено")
    }

    if (booking.userId !== userId) {
        throw new ForbiddenException("Нет прав на изменение этого бронирование")
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.ACTIVE) {
        throw new BadRequestException("Изменить можно только активное или ожидающее бронирование")
    }

    return booking
}

export function buildBookingFilterQuery(
    userId: string,
    query: FilterBookingDto
) {
    return {
        userId,
        ...(query.status && { status: query.status }),
        ...(query.spaceId && { spaceId: query.spaceId }),
        ...(query.from || query.to ? {
            startTime: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) })
            }
        } : {})
    }
}