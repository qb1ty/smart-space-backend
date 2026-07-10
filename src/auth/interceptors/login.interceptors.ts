import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Request } from "express";

@Injectable()
export class LoginInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle().pipe(
            tap((user) => {
                const req = context.switchToHttp().getRequest<Request>()

                req.session.userId = user.id
                req.session.role = user.role
            })
        )
    }
}