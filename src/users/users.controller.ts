import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SessionInfo } from 'src/auth/decorators/session-user.decorator';
import { AdminGuard, AuthGuard } from 'src/common/guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddBalanceDto } from './dto/add-balance.dto';

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  async getMe(@SessionInfo() session: { userId: string }) {
    return this.usersService.getMe(session.userId)
  }

  @Patch("me")
  @UseGuards(AuthGuard)
  async updateMe(
    @SessionInfo() session: { userId: string },
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.updateMe(session.userId, dto)
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  async findAll(
    @Query("activeOnly") activeOnly?: string
  ) {
    return this.usersService.findAll(activeOnly)
  }

  @Patch(":id/balance")
  @UseGuards(AuthGuard, AdminGuard)
  async addBalance(
    @Param("id") id: string,
    @Body() dto: AddBalanceDto
  ) {
    return this.usersService.addBalance(id, dto)
  }

  @Patch(":id/deactivate")
  @UseGuards(AuthGuard, AdminGuard)
  async deactivate(
    @SessionInfo() session: { userId: string },
    @Param("id") id: string
  ) {
    return this.usersService.deactivate(session.userId, id)
  }
}
