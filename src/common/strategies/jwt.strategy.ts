import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET || 'fallback-secret', // ✅ fallback value
        });
  }

  async validate(payload: any) {
    // This payload is from your token
    return {
      customer_id: payload.sub,
      email: payload.email,
      Phone: payload.phone,
      role: payload.role,
    };
  }
}
