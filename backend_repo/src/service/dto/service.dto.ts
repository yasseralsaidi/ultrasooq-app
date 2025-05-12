import {
  FileType,
  ServiceConfirmType,
  ServiceCostType,
  ServiceFor,
  ServiceType,
  ShippingType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  categoryId: number;

  @IsOptional()
  @IsString()
  categoryLocation?: string;

  @IsNotEmpty()
  @IsString()
  workingDays: string;

  @IsOptional()
  @IsString()
  offDays?: string;

  @IsOptional()
  @IsBoolean()
  renewEveryWeek?: boolean;

  @IsOptional()
  @IsBoolean()
  oneTime?: boolean;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsOptional()
  @IsString()
  breakTimeFrom?: string;

  @IsOptional()
  @IsString()
  breakTimeTo?: string;

  @IsOptional()
  @IsIn(['DIRECTION', 'RANG'])
  shippingType?: ShippingType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fromCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  toCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  rangeCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  stateId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  countryId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  eachCustomerTime?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  customerPerPeiod?: number;

  @IsNotEmpty()
  @IsIn(['BOOKING', 'MOVING'])
  serviceType: ServiceType;

  @IsOptional()
  @IsIn(['AUTO', 'MANUAL'])
  serviceConfirmType?: ServiceConfirmType;

  @IsOptional()
  @IsIn(['OWNER', 'EVERYONE'])
  serviceFor?: ServiceFor;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ServiceTagDto)
  tags: ServiceTagDto[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ServiceFeatureDto)
  features: ServiceFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceImageDto)
  images?: ServiceImageDto[];
}

class ServiceFeatureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsIn(['FLAT', 'HOURLY'])
  serviceCostType: ServiceCostType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  serviceCost: number;
}

class ServiceTagDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  tagId: number;
}

class ServiceImageDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsIn(['IMAGE', 'VIDEO'])
  fileType: FileType;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workingDays?: string;

  @IsOptional()
  @IsString()
  offDays?: string;

  @IsOptional()
  @IsBoolean()
  renewEveryWeek?: boolean;

  @IsOptional()
  @IsBoolean()
  oneTime?: boolean;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsOptional()
  @IsString()
  breakTimeFrom?: string;

  @IsOptional()
  @IsString()
  breakTimeTo?: string;

  @IsOptional()
  @IsIn(['DIRECTION', 'RANG'])
  shippingType?: ShippingType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fromCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  toCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  rangeCityId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  stateId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  countryId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  eachCustomerTime?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  customerPerPeiod?: number;

  @IsOptional()
  @IsIn(['AUTO', 'MANUAL'])
  serviceConfirmType?: ServiceConfirmType;

  @IsOptional()
  @IsIn(['OWNER', 'EVERYONE'])
  serviceFor?: ServiceFor;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceTagDto)
  tags: UpdateServiceTagDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceFeatureDto)
  features: UpdateServiceFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceImageDto)
  images?: UpdateServiceImageDto[];
}

class UpdateServiceTagDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  tagId: number;
}

class UpdateServiceFeatureDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsIn(['FLAT', 'HOURLY'])
  serviceCostType: ServiceCostType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  serviceCost: number;
}

class UpdateServiceImageDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsIn(['IMAGE', 'VIDEO'])
  fileType: FileType;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}
