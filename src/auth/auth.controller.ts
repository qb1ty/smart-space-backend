import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { LoginInterceptor, LogoutInterceptor } from './interceptors';
import { SessionInfo } from './decorators/session-user.decorator';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(LoginInterceptor)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @UseInterceptors(LogoutInterceptor)
    async logout() {
        return this.authService.logout()
    }

    @Get("me")
    @UseGuards(AuthGuard)
    async me(@SessionInfo() session: { userId: string, role: string }) {
        return { authenticated: true, ...session }
    }
}