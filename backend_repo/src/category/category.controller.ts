import { Body, Controller, Post, UseGuards, Request, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/guards/AuthGuard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(SuperAdminAuthGuard)
  @Post('/create') 
  // create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoryService.create(createCategoryDto);
  // }
  create(@Body() payload: any) {
    return this.categoryService.create2(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/createMultiple') 
  // create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
  createMultiple(@Body() payload: any) {
    return this.categoryService.createMultiple(payload);
  }

  // @UseGuards(SuperAdminAuthGuard)
  // @Post('/findOne') 
  // findOne(@Request() req, @Body() payload: any) {
  //   return this.categoryService.findOne(payload, req);
  // }
  // @UseGuards(SuperAdminAuthGuard)
  @Get('/findOne') 
  findOne(@Query('categoryId') categoryId: number, @Query('menuId') menuId: number) {
    return this.categoryService.findOne( categoryId, menuId);
  }

  @Get('/categoryRecusive') 
  categoryRecusive(@Query('categoryId') categoryId: number, @Query('menuId') menuId: number) {
    return this.categoryService.categoryRecusive( categoryId, menuId);
  }

  // @UseGuards(SuperAdminAuthGuard)
  @Post('/findUnique') 
  findUnique(@Request() req, @Body() payload: any) {
    return this.categoryService.findUnique(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/update') 
  update(@Request() req, @Body() payload: any) {
    return this.categoryService.update(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/delete/:categoryId')
  delete(@Param('categoryId') categoryId: number, @Request() req) {
    return this.categoryService.delete(categoryId, req);
  }

  @Get('/getMenu') 
  getMenu(@Query('categoryId') categoryId: number) {
    return this.categoryService.getMenu( categoryId );
  }

  @Get('/findAll') 
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.categoryService.findAll(page, limit);
  }

  @Get('/getCategoryLevelOne') 
  getCategoryLevelOne() {
    return this.categoryService.getCategoryLevelOne();
  }

  @Patch('/updateWhiteBlackList')
  updateWhiteBlackList(@Request() req, @Body() payload: any) {
    return this.categoryService.updateWhiteBlackList(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/createCategoryConnectTo') 
  createCategoryConnectTo(@Request() req, @Body() payload: any) {
    return this.categoryService.createCategoryConnectTo(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/deleteCategoryConnectTo/:categoryConnectToId')
  deleteCategoryConnectTo(@Param('categoryConnectToId') categoryConnectToId: number, @Request() req) {
    return this.categoryService.deleteCategoryConnectTo(categoryConnectToId, req);
  }

}
