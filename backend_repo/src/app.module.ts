import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notification/notification.module';
import { S3service } from './user/s3.service';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { RfqProductModule } from './rfq-product/rfq-product.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ChatModule } from './chat/chat.module';
import { PolicyModule } from './policy/policy.module';
import { FeesModule } from './fees/fees.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { PaymentModule } from './payment/payment.module';
import { TagModule } from './tag/tag.module';
import { StripeModule } from './stripe/stripe.module';
import { AdminMemberModule } from './admin-member/admin-member.module';
import { HelperModule } from './helper/helper.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    UserModule, 
    AuthModule, 
    CategoryModule, 
    AdminModule, 
    NotificationModule, 
    S3service, 
    ProductModule, 
    BrandModule, 
    CartModule, 
    OrderModule, 
    RfqProductModule, 
    WishlistModule, 
    ChatModule, 
    PolicyModule, 
    FeesModule, 
    TeamMemberModule, 
    PaymentModule, 
    TagModule, 
    StripeModule, 
    AdminMemberModule, HelperModule, ServiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
