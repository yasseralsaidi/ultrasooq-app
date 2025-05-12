import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'mysupersecret',
      signOptions: { expiresIn: '1h' }
    })
  ],
  providers: [AuthService]
})
export class AuthModule {}
