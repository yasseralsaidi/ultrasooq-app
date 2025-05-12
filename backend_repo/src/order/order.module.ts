import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt/dist';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, AuthService, JwtService, NotificationService]
})
export class OrderModule {}
