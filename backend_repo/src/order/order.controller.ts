import { Body, Controller, Get, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/guards/AuthGuard';

@Controller('order')
export class OrderController {

  constructor(
    private readonly orderService: OrderService,
  ) {}

  // orderCreate for buyer
  @UseGuards(AuthGuard)
  @Post('/createOrder')
  createOrder(@Request() req, @Body() payload: any) {
    return this.orderService.createOrder2(payload, req);
  }

  // orderListing for buyer
  @UseGuards(AuthGuard)
  @Get('/getAllOrderByUserId')
  getAllOrderByUserId(@Request() req, @Query('page') page: number, @Query('limit') limit: number) {
    return this.orderService.getAllOrderByUserId(page, limit, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllOrderProductByUserId')
  getAllOrderProductByUserId(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('term') term: string,
  @Query('orderProductStatus') orderProductStatus: string, @Query('startDate') startDate: string, 
  @Query('endDate') endDate: string) {
    return this.orderService.getAllOrderProductByUserId(page, limit, req, term, orderProductStatus, startDate, endDate);
  }

  @Post('/createOrderUnAuth')
  createOrderUnAuth(@Body() payload: any) {
    return this.orderService.createOrderUnAuth(payload);
  }

  @UseGuards(AuthGuard)
  @Get('/getOneOrderProductDetailByUserId')
  getOneOrderProductDetailByUserId(@Query('orderProductId') orderProductId: number, @Request() req,) {
    return this.orderService.getOneOrderProductDetailByUserId(orderProductId, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllOrderProductBySellerId')
  getAllOrderProductBySellerId(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('term') term: string,
  @Query('orderProductStatus') orderProductStatus: string) {
    return this.orderService.getAllOrderProductBySellerId(page, limit, req, term, orderProductStatus);
  }

  @UseGuards(AuthGuard)
  @Get('/getOneOrderProductDetailBySellerId')
  getOneOrderProductDetailBySellerId(@Query('orderProductId') orderProductId: number, @Request() req,) {
    return this.orderService.getOneOrderProductDetailBySellerId(orderProductId, req);
  }

  @Post('/orderProductStatusById')
  orderProductStatusById(@Body() payload: any) {
    return this.orderService.orderProductStatusById(payload);
  }

  @Patch('/orderShippingStatusUpdateById')
  orderShippingStatusUpdateById(@Body() payload: any, @Request() req) {
    return this.orderService.orderShippingStatusUpdateById(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/orderProductCancelReason')
  orderProductCancelReason(@Body() payload: any) {
    return this.orderService.orderProductCancelReason(payload);
  }

  // PreOrderCal
  @UseGuards(AuthGuard)
  @Post('/preOrderCal')
  preOrderCal(@Request() req, @Body() payload: any) {
    return this.orderService.preOrderCal(payload, req);
  }


}
