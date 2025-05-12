import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuthService, JwtService, NotificationService]
})
export class AdminModule {}
