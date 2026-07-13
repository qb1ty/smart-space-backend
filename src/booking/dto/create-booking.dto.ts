import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    spaceId!: string

    @IsDateString({}, { message: "startTime должен быть валидной ISO строкой даты" })
    startTime!: string

    @IsDateString({}, { message: "endTime должен быть валидной ISO строкой даты" })
    endTime!: string
}
