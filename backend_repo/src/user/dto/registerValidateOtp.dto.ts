import { IsString, IsEmail, MinLength, IsNumber } from 'class-validator';

export class RegisterValidateOtp {
    @IsEmail()
    email: string;

    @IsNumber()
    otp: Number;
}