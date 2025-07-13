import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module'; // Ensure UserModule is imported if needed



@Module({
  imports: [
    UserModule,
    // PrismaModule,
    JwtModule.register({
      secret: 'JWT_SECRET', // use process.env.JWT_SECRET in prod
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule]
})
export class AuthModule {}
