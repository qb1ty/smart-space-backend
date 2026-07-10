import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginInterceptor } from './interceptors/login.interceptors';
import { LogoutInterceptor } from './interceptors/logout.interceptors';
import { AuthGuard } from 'src/guard/auth.guard';

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
}