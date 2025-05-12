import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async login(user) {
        const payload = { user, sub: user.id };
        // console.log('secret: ', process.env.JWT_SECRET);
        
        return {
            data: user,
            userId: user.id,
            accessToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '7d' })
        };
    }

    async getToken(user) {
        const payload = { user, sub: user.id };
        return {
            data: user,
            userId: user.id,
            accessToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '5m' })
        };
    }

    validateToken(jwt: string) {
        try {
            return this.jwtService.verify(jwt, { secret: process.env.JWT_SECRET });
        } catch (err) {
            if (err) {
                switch (err.name) {
                    case "TokenExpiredError":
                        return {
                            error: true,
                            message: 'Link Expired!',
                        };
                    case "JsonWebTokenError":
                        return {
                            error: true,
                            message: 'Invalid Token!',
                        };
                    default:
                        return {
                            error: true,
                            message: 'Unable to Process Token',
                        };
                }
            }
        }
    }
}
