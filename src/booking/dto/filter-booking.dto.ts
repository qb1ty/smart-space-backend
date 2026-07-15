import { BookingStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class FilterBookingDto {
    @IsEnum(BookingStatus, { message: "Неверный статус бронирование" })
    @IsOptional()
    status?: BookingStatus

    @IsString()
    @IsOptional()
    spaceId?: string

    @IsDateString({}, { message: "from должно быть валидной ISO датой" })
    @IsOptional()
    from?: string

    @IsDateString({}, { message: "to должно быть валидной ISO датой" })
    @IsOptional()
    to?: string
}