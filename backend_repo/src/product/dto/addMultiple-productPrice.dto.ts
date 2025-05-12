import { IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsInt, IsPositive, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETE = 'DELETE',
  HIDDEN = 'HIDDEN'
}

// ProductPriceDTO
export class ProductPriceDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  productPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  offerPrice?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  askForStock?: string;

  @IsOptional()
  @IsString()
  askForPrice?: string;
}

// AddMultiplePriceForProductDTO
export class AddMultiplePriceForProductDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDTO)
  productPrice: ProductPriceDTO[];
}

// AddMultiplePriceForProductResponseDTO
// export class AddMultiplePriceForProductResponseDTO {
//   @IsNotEmpty()
//   @IsBoolean()
//   status: boolean;

//   @IsNotEmpty()
//   @IsString()
//   message: string;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ProductPriceDTO)
//   data: ProductPriceDTO[];

//   @IsOptional()
//   @IsString()
//   error?: string;
// }
