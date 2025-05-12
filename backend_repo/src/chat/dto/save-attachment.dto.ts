import { AttachmentStatus } from '@prisma/client';
import { IsNotEmpty, IsString, IsInt, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveAttachmentDto {
  @IsNotEmpty()
  @IsString()
  readonly fileName: string;

  @IsOptional()
  @IsString()
  readonly filePath: string;

  @IsNotEmpty()
  @IsInt()
  readonly fileSize: number;

  @IsNotEmpty()
  @IsString()
  readonly fileType: string;

  @IsNotEmpty()
  @IsString()
  readonly fileExtension: string;

  @IsNotEmpty()
  @IsNumber()
  readonly messageId?: number;

  @IsNotEmpty()
  @IsString()
  readonly uniqueId?: string;

  @IsNotEmpty()
  @IsString()
  readonly status: AttachmentStatus;
}

export class SaveAttachmentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveAttachmentDto)
  readonly attachments: SaveAttachmentDto[];
}
