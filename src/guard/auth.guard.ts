import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>()

        if (!req.session || !req.session.userId) {
            throw new UnauthorizedException("Пользователь не авторизован")
        }

        return true
    }
}