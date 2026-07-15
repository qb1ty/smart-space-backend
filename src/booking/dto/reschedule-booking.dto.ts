import { IsDateString } from "class-validator";

export class RescheduleBookingDto {
    @IsDateString({}, { message: "startTime должен быть валидной старкой даты" })
    startTime!: string

    @IsDateString({}, { message: "endTime должен быть валидной ISO строкой даты" })
    endTime!: string
}