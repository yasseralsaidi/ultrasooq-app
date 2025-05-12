import { Body, Controller, Get, Post, UseGuards, Request, Query, Param, Delete, Patch } from '@nestjs/common';
import { BrandService } from './brand.service';
import { AuthGuard } from 'src/guards/AuthGuard';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';

@Controller('brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
  ) {}

  @UseGuards(SuperAdminAuthGuard)
  @Post('/addBrand') 
  addBrand(@Request() req, @Body() payload: any) {
    return this.brandService.create(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/addBrandByUser') 
  addBrandByUser(@Request() req, @Body() payload: any) {
    return this.brandService.create(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/update') 
  update(@Request() req, @Body() payload: any) {
    return this.brandService.update(payload, req);
  }

  @Get('/findAll') 
  findAll(@Query('term') term: string, @Query('addedBy') addedBy: number, @Query('type') type: string) {
    return this.brandService.findAll(term, addedBy, type);
  }

  @Get('/getAllBrand') 
  getAllBrand(@Query('page') page: number, @Query('limit') limit: number, @Query('term') term: string) {
    return this.brandService.findAllWithPagination(page, limit, term);
  }

  @Get('/findOne') 
  findOne(@Query('brandId') brandId: number, @Request() req) {
    return this.brandService.findOne(brandId, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/delete/:brandId') 
  delete(@Param('brandId') brandId: number, @Request() req) {
    return this.brandService.delete(brandId, req);
  }
}
