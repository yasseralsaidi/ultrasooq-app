import { JsonArray, JsonObject } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class AddCartServiceDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  serviceId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartServiceFeatureDto)
  features: CartServiceFeatureDto[];
}

class CartServiceFeatureDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  serviceFeatureId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class AddCartServiceProdDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  cartId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  serviceId: number;

  @IsNotEmpty()
  @IsIn(['PRODUCT'])
  relatedCartType: 'PRODUCT';

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productPriceId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsIn(['SERVICE'])
  cartType: 'SERVICE';

  @IsOptional()
  @IsJSON()
  object?: {
    [key: string]: JSONValue;
  };
}

type JSONValue = string | number | boolean | null | JsonObject | JsonArray;
