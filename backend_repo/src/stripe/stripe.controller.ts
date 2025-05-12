import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/account-create') 
  create(@Request() req) {
    return this.stripeService.createStripeAccount(req);
  }

  @UseGuards(AuthGuard) 
  @Get('/get-account') 
  getAccount(@Request() req) {
    return this.stripeService.getAccount(req);
  }

  @UseGuards(AuthGuard)
  @Patch('/account-update') 
  updateStripeAccount(@Request() req) {
    return this.stripeService.updateStripeAccount(req);
  }

}
