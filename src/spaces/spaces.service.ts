import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { SpaceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleServiceError } from 'src/common/utils';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name)
  private readonly SPACES_CACHE_KEY = "spaces_catalog"

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  async create(dto: CreateSpaceDto) {
    try {
      const newSpace = await this.prisma.space.create({ data: dto })
      await this.cache.del(this.SPACES_CACHE_KEY)
      
      return newSpace
    } catch (err: any) {
      handleServiceError(err, this.logger, `Не удалось создать пространство ${dto.name}`)
    }
  }

  async findAll(type?: SpaceType, activeOnly?: boolean) {
    try {
      const isGeneralQuery = !type && activeOnly === undefined

      if (isGeneralQuery) {
        const cachedSpaces = await this.cache.get(this.SPACES_CACHE_KEY)
        if (cachedSpaces !== undefined) {
          return cachedSpaces
        }
      }

      const spaces = await this.prisma.space.findMany({
        where: {
          ...(type && { type }),
          ...(activeOnly !== undefined && { isActive: activeOnly })
        },
        orderBy: { name: "asc" }
      })

      if (isGeneralQuery) {
        await this.cache.set(this.SPACES_CACHE_KEY, spaces)
      }

      return spaces
    } catch (err: any) {
      handleServiceError(err, this.logger, "Ошибка при получения списка пространства")
    }
  }

  async findOne(id: string) {
    try {
      const space = await this.prisma.space.findUnique({ where: { id } })
  
      if (!space) {
        throw new NotFoundException("Пространство не найдено")
      }
  
      return space
    } catch (err: any) {
      handleServiceError(err, this.logger, `Ошибка при поиске пространства с ID ${id}`)
    }
  }

  async update(id: string, dto: UpdateSpaceDto) {
    try {
      const spaces = await this.prisma.space.update({
        where: { id },
        data: dto
      })

      await this.cache.del(this.SPACES_CACHE_KEY)
      
      return spaces
    } catch (err: any) {
      handleServiceError(err, this.logger, `Не удалось обновить пространства с ID ${id}`)
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.space.delete({ where: { id } })
      
      await this.cache.del(this.SPACES_CACHE_KEY)
    } catch (err: any) {
      handleServiceError(err, this.logger, `Не удалось удалить пространства с ID ${id}`)
    }
  }
}