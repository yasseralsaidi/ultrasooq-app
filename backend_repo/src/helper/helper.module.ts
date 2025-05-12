import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [HelperService, AuthService, JwtService]
})
export class HelperModule {}
