import { SpaceType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSpaceDto {
    @IsString()
    @IsNotEmpty({ message: "Название пространства обязательно" })
    name!: string

    @IsEnum(SpaceType, { message: "Неверный тип пространства (DESK, MEETING_ROOM, PHONE_BOOTH)" })
    type!: SpaceType

    @IsInt()
    @Min(1, { message: "Вместимость должна быть минимум 1 человек" })
    @IsOptional()
    capacity?: number
    
    @IsInt()
    @Min(0)
    @IsOptional()
    pricePerHour?: number

    @IsNumber()
    @IsOptional()
    mapX?: number

    @IsNumber()
    @IsOptional()
    mapY?: number

    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}
