import { IsNumber, IsString, IsOptional, IsEnum, Min, Max, IsInt, IsNotEmpty } from 'class-validator';

enum ConsumerType {
    CONSUMER = 'CONSUMER',
    VENDORS = 'VENDORS',
    EVERYONE = 'EVERYONE'
}

enum SellType {
    NORMALSELL = 'NORMALSELL',
    BUYGROUP = 'BUYGROUP',
    OTHERS = 'OTHERS'
}

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETE = 'DELETE',
    HIDDEN = 'HIDDEN'
}

export class UpdatedProductPriceDto {
    // @IsNumber()
    // id: number;

    @IsNotEmpty()
    @IsNumber()
    productPriceId: number;

    // @IsNumber()
    // productId: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    productPrice: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    offerPrice: number;

    @IsOptional()
    @IsString()
    productPriceBarcode?: string;

    @IsOptional()
    @IsNumber()
    productLocationId?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryAfter?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    timeOpen?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    timeClose?: number;

    @IsOptional()
    @IsEnum(ConsumerType)
    consumerType?: ConsumerType;

    @IsOptional()
    @IsEnum(SellType)
    sellType?: SellType;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    vendorDiscount?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    consumerDiscount?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    minQuantity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    maxQuantity?: number;

    @IsOptional()
    @IsString()
    productCondition?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    minCustomer?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    maxCustomer?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    minQuantityPerCustomer?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    maxQuantityPerCustomer?: number;

    // @IsOptional()
    @IsEnum(Status)
    status?: Status;
}
