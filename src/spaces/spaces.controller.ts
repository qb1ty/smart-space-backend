import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseBoolPipe } from '@nestjs/common';
import { SpaceType } from '@prisma/client';
import { AuthGuard, AdminGuard } from 'src/common/guard';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Controller("spaces")

export class SpacesController {
  constructor(private readonly spaceService: SpacesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() dto: CreateSpaceDto) {
    return this.spaceService.create(dto)
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Query("type") type: SpaceType,
    @Query("activeOnly", new ParseBoolPipe({ optional: true }))  activeOnly: boolean
  ) {
    return this.spaceService.findAll(type, activeOnly)
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.spaceService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AuthGuard, AdminGuard)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateSpaceDto
  ) {
    return this.spaceService.update(id, dto)
  }

  @Delete(":id")
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param("id") id: string) {
    return this.spaceService.remove(id)
  }
}
