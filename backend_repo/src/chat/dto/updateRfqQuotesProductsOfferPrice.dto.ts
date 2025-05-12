import { IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class UpdateRfqQuotesProductsOfferPrice {
    @IsNotEmpty()
    @IsInt()
    readonly id: number;

    @IsNotEmpty()
    @IsInt()
    readonly rfqUserId: number;

    @IsNotEmpty()
    @IsNumber()
    readonly offerPrice: number;
}