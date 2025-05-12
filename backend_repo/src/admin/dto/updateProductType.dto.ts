import { IsString, IsEmail, MinLength, IsNumber, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

enum TypeProduct {
    VENDORLOCAL = 'VENDORLOCAL',
    BRAND = 'BRAND'
}
export class UpdateProductTypeDTO {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsOptional()
    @IsEnum(TypeProduct)
    typeProduct?: TypeProduct;
}