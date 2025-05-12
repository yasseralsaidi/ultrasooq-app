import { IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsInt, IsPositive, IsBoolean, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETE = 'DELETE',
  HIDDEN = 'HIDDEN'
}

enum ConsumerType {
  CONSUMER = 'CONSUMER',
  VENDORS = 'VENDORS',
  EVERYONE = 'EVERYONE',
}
  
enum SellType {
  NORMALSELL = 'NORMALSELL',
  BUYGROUP = 'BUYGROUP',
  OTHERS = 'OTHERS',
  EVERYONE = 'EVERYONE',
}

// ProductPriceDTO
export class ProductPriceDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productPriceId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offerPrice?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  productLocationId?: number;

  @IsOptional()
  @IsNumber()
  // @IsPositive()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryAfter?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeOpen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeClose?: number;

  @IsOptional()
  @IsEnum(ConsumerType)
  consumerType?: ConsumerType;

  @IsOptional()
  @IsEnum(SellType)
  sellType?: SellType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vendorDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consumerDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @IsString()
  productCondition?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCustomer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCustomer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantityPerCustomer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantityPerCustomer?: number;

  @IsOptional()
  @IsString()
  askForStock?: string;

  @IsOptional()
  @IsString()
  askForPrice?: string;
}

// AddMultiplePriceForProductDTO
export class UpdateMultiplePriceForProductDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDTO)
  productPrice: ProductPriceDTO[];
}

