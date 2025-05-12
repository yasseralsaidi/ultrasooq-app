import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {

  constructor(
    private readonly paymentService: PaymentService,
  ) { }


  /**
   * Paymob
   */
  @Get('/get-auth-token')
  getAuthToken(@Request() req) {
    return this.paymentService.getAuthToken(req);
  }

  // @UseGuards(AuthGuard)
  // @Post('/create-paymob-payment')
  // createPaymentPaymobAxios(@Request() req, @Body() payload: any) {
  //   return this.paymentService.createPaymentPaymobAxios(payload, req);
  // }

  @UseGuards(AuthGuard)
  @Post('/create-paymob-intention')
  createIntention(@Request() req, @Body() payload: any) {
    return this.paymentService.createIntention(payload, req);
  }

  @Post('/paymob-webhook')
  paymobWebhook(@Request() req, @Body() payload: any) {
    return this.paymentService.paymobWebhook(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/createPaymentLink')
  createPaymentLink(@Request() req, @Body() payload: any) {
    return this.paymentService.createPaymentLink(payload, req);
  }

  @Post('/paymob-webhook-createPaymentLink')
  paymobwebhookForCreatePaymentLink(@Request() req, @Body() payload: any) {
    return this.paymentService.paymobwebhookForCreatePaymentLink(payload, req);
  }

  @Post('/createSaveCardToken')
  createSaveCardToken(@Request() req, @Body() payload: any) {
    return this.paymentService.createSaveCardToken(req);
  }

  @UseGuards(AuthGuard)
  @Get('/transaction/getl-all')
  getAllTransaction(@Request() req) {
    return this.paymentService.getAllTransaction(req);
  }

  @Post('/createPaymentUsingSaveCardToken')
  createPaymentUsingSaveCardToken(@Request() req, @Body() payload: any) {
    return this.paymentService.createPaymentUsingSaveCardToken(req);
  }

  @Post('/createPaymentForEMI')
  createPaymentForEMI(@Request() req, @Body() payload: any) {
    return this.paymentService.createPaymentForEMI(payload, req);
  }

  @Post('/webhook-PaymentForEMI')
  webhookForFirstEMI(@Request() req, @Body() payload: any) {
    return this.paymentService.webhookForFirstEMI(req);
  }

  @Post('/webhookForEMI')
  webhookForEMI(@Request() req, @Body() payload: any) {
    return this.paymentService.webhookForEMI(req);
  }

  // used for testing purpose
  @Post('/payInstallment-testing')
  payInstallment(@Request() req, @Body() payload: any) {
    return this.paymentService.payInstallment(req);
  }

}
