import { IsInt, Min } from "class-validator";

export class AddBalanceDto {
    @IsInt({ message: "Сумма начисления должна быть целым числом" })
    @Min(1, { message: "Минимальное начисление - 1 монета" })
    amount!: number
}