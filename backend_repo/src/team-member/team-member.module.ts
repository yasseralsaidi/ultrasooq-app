import { Module } from '@nestjs/common';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberService } from './team-member.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import { HelperService } from 'src/helper/helper.service';

@Module({
  controllers: [TeamMemberController],
  providers: [TeamMemberService, UserService, AuthService, JwtService, NotificationService, S3service, HelperService]
})
export class TeamMemberModule {}
