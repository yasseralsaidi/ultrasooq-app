import { IsString, IsEmail, MinLength } from 'class-validator';

enum TypeTrader {
    BUYER = 'BUYER',
    FREELANCER = 'FREELANCER',
    COMPANY = 'COMPANY'
}

export class CreateUserDto {
    id: number;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    cc: string;

    @IsString()
    phoneNumber: string;

    tradeRole: TypeTrader;

    loginType: string;
}