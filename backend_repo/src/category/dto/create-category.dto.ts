import { IsString, IsEmail, MinLength, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    id: number;


    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    parentId: number;

    @IsNotEmpty()
    @IsNumber()
    menuId: number;

    @IsNotEmpty()
    @IsString()
    type: string;
}