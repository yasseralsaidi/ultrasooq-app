import { IsNotEmpty, IsString, IsInt, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SaveAttachmentDto } from './save-attachment.dto';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @IsNotEmpty()
  @IsInt()
  readonly userId: number;

  @IsNotEmpty()
  @IsInt()
  readonly roomId: number;

  @IsNotEmpty()
  @IsInt()
  readonly rfqId: number;

  @IsOptional()
  @IsNumber()
  readonly requestedPrice?: number;

  @IsOptional()
  @IsNumber()
  readonly rfqQuoteProductId?: number;

  @IsOptional()
  @IsNumber()
  readonly rfqQuotesUserId?: number;

  @IsOptional()
  @IsNumber()
  readonly buyerId?: number;

  @IsOptional()
  @IsNumber()
  readonly sellerId?: number;

  @IsOptional()
  @IsNumber()
  readonly uniqueId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveAttachmentDto)
  readonly attachments: SaveAttachmentDto[];
}