import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class ProductTagDto {
  @IsNotEmpty()
  @IsInt()
  tagId: number;
}

class ProductImageDto {
  @IsOptional()
  @IsString()
  imageName?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  videoName?: string;

  @IsOptional()
  @IsString()
  video?: string;
}

class ProductPriceDto {
  @IsNotEmpty()
  @IsNumber()
  productPrice: number;

  @IsOptional()
  @IsNumber()
  offerPrice?: number;

  @IsOptional()
  @IsInt()
  productLocationId?: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsString()
  deliveryAfter?: string;

  @IsOptional()
  @IsString()
  timeOpen?: string;

  @IsOptional()
  @IsString()
  timeClose?: string;

  @IsOptional()
  @IsString()
  consumerType?: string;

  @IsOptional()
  @IsString()
  sellType?: string;

  @IsOptional()
  @IsNumber()
  vendorDiscount?: number;

  @IsOptional()
  @IsNumber()
  consumerDiscount?: number;

  @IsOptional()
  @IsInt()
  minQuantity?: number;

  @IsOptional()
  @IsInt()
  maxQuantity?: number;
}

class ProductShortDescriptionDto {
  @IsNotEmpty()
  @IsString()
  shortDescription: string;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  productType?: string = 'P';

  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsInt()
  placeOfOriginId?: number;

  @IsNotEmpty()
  @IsString()
  skuNo: string;

  @IsOptional()
  @IsNumber()
  productPrice?: number = 0;

  @IsOptional()
  @IsNumber()
  offerPrice?: number = 0;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsString()
  categoryLocation?: string;

  @IsOptional()
  @IsString()
  status?: string = 'INACTIVE';

  @IsOptional()
  @IsInt()
  adminId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTagDto)
  productTagList?: ProductTagDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  productImagesList?: ProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDto)
  productPriceList?: ProductPriceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductShortDescriptionDto)
  productShortDescriptionList?: ProductShortDescriptionDto[];
}
