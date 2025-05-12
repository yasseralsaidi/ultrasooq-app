import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOneProductPriceDto {
  @IsInt()
  @Type(() => Number)
  productPriceId: number;
}
