import { BadRequestException, ConflictException } from "@nestjs/common";
import { BookingStatus, Prisma } from "@prisma/client";

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
    endTime: Date
) {
    const overlapping = await tx.booking.findFirst({
        where: {
            spaceId,
            status: { in: [BookingStatus.PENDING, BookingStatus.ACTIVE] },
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
    if (!user || user.balance < cost) {
        throw new BadRequestException(`Недостаточно балов. Требуется: ${cost}, у вас: ${user?.balance || 0}`)
    }

    await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: cost } }
    })
}