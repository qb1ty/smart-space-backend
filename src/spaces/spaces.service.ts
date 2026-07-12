import { Injectable, NotFoundException } from '@nestjs/common';
import { SpaceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSpaceDto) {
    return this.prisma.space.create({ data: dto })
  }

  async findAll(type?: SpaceType, activeOnly?: boolean) {
    return this.prisma.space.findMany({
      where: {
        ...(type && { type }),
        ...(activeOnly !== undefined && { isActive: activeOnly })
      },
      orderBy: { name: "asc" }
    })
  }

  async findOne(id: string) {
    const space = await this.prisma.space.findUnique({ where: { id } })

    if (!space) {
      throw new NotFoundException("Пространство не найдено")
    }

    return space
  }

  async update(id: string, dto: UpdateSpaceDto) {
    await this.findOne(id)

    return this.prisma.space.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    return this.prisma.space.delete({ where: { id } })
  }
}
