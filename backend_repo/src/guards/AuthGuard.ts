import { CanActivate, ExecutionContext, Inject, Logger, Request, HttpStatus, HttpException, BadRequestException, Injectable,} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

interface TokenValidationResult {
  error: boolean;
  user: any; // Adjust the type as per your actual user type
  message: string
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
      let req = context.switchToHttp().getRequest();
      try {
          let jwt = req.headers['authorization']
          jwt = jwt.split(" ")[1];
          const data = await this.authService.validateToken(jwt)
          // const res: TokenValidationResult = await lastValueFrom(data);
          const res: TokenValidationResult = data;
  
          if (res.error == true) {
            throw new BadRequestException({
                status: HttpStatus.FORBIDDEN,
                message: res.message
            });
          }

          req.user = res['user'];
          // console.log("req.user: ", req.user);

          return res;

      } catch (err) {
        throw new BadRequestException({
          message: err?.response?.message || 'Forbidden resource',
          error: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new BadRequestException('Just a custom message...');
    }
    return user;
  }
}
