import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { S3service } from 'src/user/s3.service';
import { HelperService } from 'src/helper/helper.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, UserService, AuthService, JwtService, NotificationService, S3service, HelperService]
})
export class ProductModule {}
