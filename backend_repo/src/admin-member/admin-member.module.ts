import { Module } from '@nestjs/common';
import { AdminMemberController } from './admin-member.controller';
import { AdminMemberService } from './admin-member.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import { HelperService } from 'src/helper/helper.service';

@Module({
  controllers: [AdminMemberController],
  providers: [AdminMemberService, UserService, AuthService, JwtService, NotificationService, S3service, HelperService]
})
export class AdminMemberModule {}
