import { Body, Controller, Get, Post, UseGuards, Request, UploadedFiles, UseInterceptors, Patch, Query, Delete } from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {

  constructor(
    private readonly wishlistService: WishlistService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/create') 
  addWishList(@Request() req, @Body() payload: any) {
    return this.wishlistService.addWishList(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllWishListByUser') 
  getAllWishListByUser(@Request() req, @Query('page') page: number, @Query('limit') limit: number) {
    return this.wishlistService.getAllWishListByUser(page, limit, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete') 
  deleteWishList(@Request() req, @Query('productId') productId: number) {
    return this.wishlistService.deleteWishList(productId, req);
  }

  @UseGuards(AuthGuard)
  @Get('/wishlistCount') 
  wishlistCount(@Request() req) {
    return this.wishlistService.wishlistCount(req);
  }

}
