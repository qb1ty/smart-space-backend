import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(private prisma: PrismaService) {}

    async register(dto: RegisterDto) {
        try {
            const passwordHash = await bcrypt.hash(dto.password, 10)
    
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    firstname: dto.firstname,
                    lastname: dto.lastname
                }
            })

            const { passwordHash: _, ...result } = user
            return result
        } catch (err: any) {
            handleServiceError(err, this.logger, "Ошибка при создании аккаунта")
        }
    }

    async login(dto: LoginDto) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
            if (!user) {
                throw new UnauthorizedException("Неверный email или пароль")
            }
            
            const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)
            if (!isPasswordValid) {
                throw new UnauthorizedException("Неверный email или пароль")
            }
    
            const { passwordHash: _, ...result } = user
            return result
        } catch (err: any) {
            handleServiceError(err, this.logger, "Ошибка при входе в аккаунт")
        }
    }

    async logout() {
        return { message: "Успешный выход" }
    }
}
