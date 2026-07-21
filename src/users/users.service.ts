import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleServiceError } from 'src/common/utils';
import { cancelUserFutureBookingsQuery, deactivateUserQuery, getAllUSersQuery, getSafeUserByIdQuery, incrementUserBalanceQuery, SAFE_USER_SELECT } from './utils/users-db.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddBalanceDto } from './dto/add-balance.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    try {
      const user = await getSafeUserByIdQuery(this.prisma, userId)
      
      if (!user) {
        throw new NotFoundException("Пользователь не найден")
      }

      return user
    } catch (err: any) {
      handleServiceError(err, this.logger, "Ошибка при получении профиля")
    }
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: SAFE_USER_SELECT
      })
    } catch (err: any) {
      handleServiceError(err, this.logger, "Ошибка при обновлении профиля")
    }
  }

  async findAll(activeOnly?: boolean) {
    try {
      return await getAllUSersQuery(this.prisma, activeOnly)
    } catch (err: any) {
      handleServiceError(err, this.logger, "Ошибка при получения списка сотрудников")
    }
  }

  async addBalance(userId: string, dto: AddBalanceDto) {
    try {
      const user = await getSafeUserByIdQuery(this.prisma, userId)

      if (!user) {
        throw new NotFoundException("Пользователь не найден")
      }

      if (!user.isActive) {
        throw new BadRequestException("Нельзя начислять монету деактивированнаму сотруднику")
      }

      return await incrementUserBalanceQuery(this.prisma, userId, dto.amount)
    } catch (err: any) {
      handleServiceError(err, this.logger, `Ошибка при начисления баланса сотруднику ${userId}`)
    }
  }

  async deactivate(adminId: string, userId: string) {
    try {
      if (adminId === userId) {
        throw new BadRequestException("Вы не можете деактивировать самого себя")
      }

      const user = await getSafeUserByIdQuery(this.prisma, userId)
      
      if (!user) {
        throw new NotFoundException("Пользователь не найден")
      }

      if (!user.isActive) {
        throw new BadRequestException("Пользователь уже деактивирован")
      }

      const [deactivatedUser, cancelledBooking] = await this.prisma.$transaction([
        deactivateUserQuery(this.prisma, userId),
        cancelUserFutureBookingsQuery(this.prisma, userId)
      ])

      return { deactivatedUser, cancelledBooking }
    } catch (err: any) {
      handleServiceError(err, this.logger, `Ошибка при деактивации сотрудника ${userId}`)
    }
  }
}
