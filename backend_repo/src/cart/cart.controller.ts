import {
  Controller,
  Patch,
  UseGuards,
  Request,
  Body,
  Get,
  Query,
  Delete,
  Post,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { CartService } from './cart.service';
import { AddCartServiceDto, AddCartServiceProdDto } from './dto/cart.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard)
  @Patch('/addToCart')
  addToCart(@Request() req, @Body() payload: any) {
    return this.cartService.addToCart(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/update')
  update(@Request() req, @Body() payload: any) {
    return this.cartService.update(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateCartServiceWithProduct')
  updateCartServiceWithProduct(@Request() req, @Body() payload: any) {
    return this.cartService.updateCartServiceWithProduct(payload, req);
  }

  @Patch('/updateUnAuth')
  updateUnAuth(@Request() req, @Body() payload: any) {
    return this.cartService.update(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/list')
  list(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('deviceId') deviceId: any,
  ) {
    return this.cartService.list(page, limit, req, deviceId);
  }

  @Get('/listUnAuth')
  listUnAuth(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('deviceId') deviceId: any,
  ) {
    return this.cartService.list(page, limit, req, deviceId);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateUserIdBydeviceId')
  updateUserIdBydeviceId(@Request() req, @Body() payload: any) {
    return this.cartService.updateUserIdBydeviceId(payload, req);
  }

  @Delete('/delete')
  delete(@Query('cartId') cartId: number) {
    return this.cartService.deleteProduct(cartId);
  }

  @Delete('/deleteProduct')
  deleteProduct(@Query('cartId') cartId: number) {
    return this.cartService.deleteProduct(cartId);
  }

  @Post('/cartCountUnAuth')
  cartCountUnAuth(@Request() req, @Body() payload: any) {
    return this.cartService.cartCount(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/cartCount')
  cartCount(@Request() req, @Body() payload: any) {
    return this.cartService.cartCount(payload, req);
  }

  @Post('/deleteAllCartItemByUserId')
  deleteAllCartItemByUserId(@Request() req, @Body() payload: any) {
    return this.cartService.deleteAllCartItemByUserId(payload, req);
  }

  // ----- ***** RFQ CART BEGINS ***** -----
  @UseGuards(AuthGuard)
  @Patch('/updateRfqCart')
  updateRfqCart(@Request() req, @Body() payload: any) {
    return this.cartService.updateRfqCart(payload, req);
  }

  @Patch('/updateRfqCartUnAuth')
  updateRfqCartUnAuth(@Request() req, @Body() payload: any) {
    return this.cartService.updateRfqCart(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/rfqCartlist')
  rfqCartlist(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('deviceId') deviceId: any,
  ) {
    return this.cartService.rfqCartlist(page, limit, req, deviceId);
  }

  @Get('/rfqCartlistUnAuth')
  rfqCartlistUnAuth(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('deviceId') deviceId: any,
  ) {
    return this.cartService.rfqCartlist(page, limit, req, deviceId);
  }

  @Delete('/rfqCartDelete')
  rfqCartDelete(@Query('rfqCartId') rfqCartId: number) {
    return this.cartService.rfqCartDelete(rfqCartId);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateRfqCartUserIdBydeviceId')
  updateRfqCartUserIdBydeviceId(@Request() req, @Body() payload: any) {
    return this.cartService.updateRfqCartUserIdBydeviceId(payload, req);
  }

  @Post('/deleteAllRfqCartItemByUserId')
  deleteAllRfqCartItemByUserId(@Request() req, @Body() payload: any) {
    return this.cartService.deleteAllRfqCartItemByUserId(payload, req);
  }

  // ----- ***** RFQ CART ENDS ***** -----

  @UseGuards(AuthGuard)
  @Patch('/updateFactoriesCart')
  updateFactoriesCart(@Request() req, @Body() payload: any) {
    return this.cartService.addUpdateFactoriesCart(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllFactoriesCart')
  getAllFactoriesCart(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('deviceId') deviceId: any,
  ) {
    return this.cartService.getAllFactoriesCart(page, limit, req, deviceId);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteFactoriesCart')
  deleteFactoriesCart(@Query('factoriesCartId') factoriesCartId: number) {
    return this.cartService.deleteFactoriesCart(factoriesCartId);
  }

  @UseGuards(AuthGuard)
  @Patch('updateservice')
  updateService(@Body() dto: AddCartServiceDto, @GetUser('id') userId: number) {
    return this.cartService.updateCartService(dto, userId);
  }

  @UseGuards(AuthGuard)
  @Patch('updateservice/product')
  updateServiceProduct(
    @Body() dto: AddCartServiceProdDto,
    @GetUser('id') userId: number,
  ) {
    return this.cartService.updateServiceProduct(dto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete('deleteService/:cartid')
  deleteCartService(
    @Param('cartid', ParseIntPipe) cartId: number,
    @Query(
      'servicefeatureids',
      new DefaultValuePipe([]),
      new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
    )
    serviceFeatureIds: number[],
    @Query(
      'serviceprodidsids',
      new DefaultValuePipe([]),
      new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
    )
    serviceProdIds: number[],
    @GetUser('id') userId: number,
  ) {
    return this.cartService.deleteCartService(
      cartId,
      userId,
      serviceFeatureIds,
      serviceProdIds,
    );
  }
}
