import { IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class UpdateMessageStatus {
    @IsNotEmpty()
    @IsNumber()
    readonly userId?: number;

    @IsNotEmpty()
    @IsInt()
    readonly roomId: number;
}