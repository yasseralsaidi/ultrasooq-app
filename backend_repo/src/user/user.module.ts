import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from './s3.service';
import { HelperService } from 'src/helper/helper.service';

@Module({
  providers: [UserService, AuthService, JwtService, NotificationService, S3service, HelperService],
  controllers: [UserController]
})
export class UserModule {}
