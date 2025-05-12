import { IsNotEmpty, IsInt, IsArray, ArrayNotEmpty, IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SaveAttachmentDto } from './save-attachment.dto';

export class CreateRoomDto {
    @IsArray()
    @ArrayNotEmpty()
    readonly participants: number[];

    @IsNotEmpty()
    @IsInt()
    readonly creatorId: number;

    @IsNotEmpty()
    @IsString()
    readonly content: string;

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
    readonly buyerId?: number;
  
    @IsOptional()
    @IsNumber()
    readonly sellerId?: number;

    @IsOptional()
    @IsNumber()
    readonly rfqQuotesUserId?: number;

    @IsOptional()
    @IsNumber()
    readonly uniqueId?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaveAttachmentDto)
    readonly attachments: SaveAttachmentDto[];
}