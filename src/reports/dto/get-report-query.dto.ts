import { IsDateString, IsOptional } from "class-validator";

export class GetReportQueryDto {
    @IsDateString({}, { message: "Параметр (from) должен быть валидной ISO строкой" })
    @IsOptional()
    from?: string

    @IsDateString({}, { message: "Параметр (to) должен быть валидной ISO строкой" })
    @IsOptional()
    to?: string
}