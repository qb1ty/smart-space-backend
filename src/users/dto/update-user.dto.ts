import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(2, { message: "Имя должно быть не короче 2 символов" })
    firstname?: string

    @IsString()
    @IsOptional()
    @MinLength(2, { message: "Фамилия должно быть не короче 2 символов" })
    lastname?: string
}