import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [NotificationService, AuthService, JwtService]
})
export class NotificationModule {}
