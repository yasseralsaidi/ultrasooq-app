import { IsNotEmpty, IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class UpdateRfqPriceRequest {
    @IsNotEmpty()
    @IsInt()
    readonly id: number;

    @IsNotEmpty()
    @IsString()
    readonly status: string;

    @IsNotEmpty()
    @IsNumber()
    readonly userId?: number;

    @IsNotEmpty()
    @IsInt()
    readonly roomId: number;

    @IsNotEmpty()
    @IsInt()
    readonly rfqUserId: number;

    @IsNotEmpty()
    @IsInt()
    readonly requestedPrice: number;

    @IsNotEmpty()
    @IsInt()
    readonly rfqQuoteProductId: number;
}