import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { S3service } from 'src/user/s3.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [ChatService, ChatGateway, S3service, AuthService, JwtService],
  controllers: [ChatController],
})
export class ChatModule {}
