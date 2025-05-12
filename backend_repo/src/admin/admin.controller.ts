import { Body, Controller, Post, UseGuards, Request, Get, Query, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';
import { UpdateProductTypeDTO } from './dto/updateProductType.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('/login')
  login(@Body() payload: any) {
    return this.adminService.login(payload)
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/findOne')
  findOne(@Request() req, @Body() payload: any) {
    return this.adminService.findOne(payload, req)
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/get-permission')
  getPermission(@Request() req, @Body() payload: any) {
    return this.adminService.getPermission(payload, req)
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/me')
  me(@Request() req, @Body() payload: any) {
    return this.adminService.findOne(payload, req)
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getAllProduct')
  getAllProduct(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sortType') sortType: string,
    @Query('term') term: string, @Query('brandIds') brandIds: any, @Query('priceMin') priceMin: any, @Query('priceMax') priceMax: any,
    @Query('status') status: any, @Query('sortOrder') sortOrder: string,
    @Query('productType') productType: string,  @Query('categoryId') categoryId: any) {
    return this.adminService.getAllProduct(page, limit, req, term, sortType, sortOrder, brandIds, priceMin, priceMax, status, productType, categoryId);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/updateProductType')
  updateProductType(@Request() req, @Body() payload: UpdateProductTypeDTO) {
    return this.adminService.updateProductType(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/updateProduct')
  updateProduct(@Request() req, @Body() payload: any) {
    return this.adminService.updateProduct(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getOneProduct')
  getOneProduct(@Request() req, @Query('productId') productId: number) {
    return this.adminService.getOneProduct(productId, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getOneProductAllQuestion')
  getOneProductAllQuestion(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('productId') productId: number,
  @Query('sortType') sortType: string,) {
    return this.adminService.getOneProductAllQuestion(page, limit, productId, sortType);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/deleteProductQuestion/:productQuestionId')
  deleteProductQuestion(@Param('productQuestionId') productQuestionId: number, @Request() req, @Body() payload: any) {
    return this.adminService.deleteProductQuestion(productQuestionId);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/deleteProduct/:productId')
  deleteProduct(@Param('productId') productId: number, @Request() req, @Body() payload: any) {
    return this.adminService.deleteProduct(productId, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/createDynamicForm')
  createDynamicForm(@Body() payload: any) {
    return this.adminService.createDynamicForm(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/findDynamicFormById')
  dynamicFormDetails(@Body() payload: any) {
    return this.adminService.dynamicFormDetails(payload);
  }

  // @UseGuards(SuperAdminAuthGuard)
  @Post('/dynamicFormDetailsList')
  dynamicFormDetailsList(@Body() payload: any) {
    return this.adminService.dynamicFormDetailsList(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/dynamicFormDetailsDelete')
  dynamicFormDetailsDelete(@Body() payload: any) {
    return this.adminService.dynamicFormDetailsDelete(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/dynamicFormDetailsEdit')
  dynamicFormDetailsEdit(@Body() payload: any) {
    return this.adminService.dynamicFormDetailsEdit(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/assignFormToCategory')
  assignFormToCategory(@Body() payload: any) {
    return this.adminService.assignFormToCategory(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/updateAssignFormToCategory')
  updateAssignFormToCategory(@Body() payload: any) {
    return this.adminService.updateAssignFormToCategory(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Post('/editAssignFormToCategory')
  editAssignFormToCategory(@Body() payload: any) {
    return this.adminService.editAssignFormToCategory(payload);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getAllUser')
  getAllUser(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('tradeRole') tradeRole: string) {
    return this.adminService.getAllUser(page, limit, tradeRole);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/updateOneUser')
  updateOneUser(@Request() req) {
    return this.adminService.updateOneUser(req);
  }

  // ---- RFQ SECTION BEGINS ----
  @UseGuards(SuperAdminAuthGuard)
  @Get('/getAllRfqQuotes')
  getAllRfqQuotes(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string) {
    return this.adminService.getAllRfqQuotes(page, limit, req, sort);
  }
  // ---- RFQ SECTION ENDS ----


  @Get('/getAllCountry')
  getAllCountry(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string) {
    return this.adminService.getAllCountry(page, limit, req, sort);
  }

  @Get('/getAllStates')
  getAllStates(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string, @Query('countryId') countryId: string) {
    return this.adminService.getAllStates(page, limit, req, sort, countryId);
  }

  @Get('/getAllCities')
  getAllCities(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string, @Query('stateId') stateId: string) {
    return this.adminService.getAllCities(page, limit, req, sort, stateId);
  }

  /**
   *  Permission CRUD
   */

  @UseGuards(SuperAdminAuthGuard)
  @Post('/create-permission')
  createPermission(@Body() payload: any, @Request() req) {
    return this.adminService.createPermission(payload, req);
  }


  @Get('/permission/get-all')
  getAllPermission(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: string) {
    return this.adminService.getAllPermission(page, limit, searchTerm, req);
  }

  /**
   * Help Center
   */
  @UseGuards(SuperAdminAuthGuard)
  @Get('/help-center/get-all')
  getAllHelpCenter(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: string) {
    return this.adminService.getAllHelpCenter(page, limit, searchTerm, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/help-center/reply')
  replyHelpCenterById(@Body() payload: any, @Request() req) {
    return this.adminService.replyHelpCenterById(payload, req);
  }

  /**
   * Finance Management (Admin side transaction list)
   */
  @UseGuards(SuperAdminAuthGuard)
  @Get('/transaction/get-all')
  getAllTransaction(@Request() req) {
    return this.adminService.getAllTransaction(req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/transaction/get-one')
  getOneTransaction(@Request() req) {
    return this.adminService.getOneTransaction(req);
  }

  /**
   * Order Details (Admin Side)
   */
  @UseGuards(SuperAdminAuthGuard)
  @Get('/order/get-all')
  getAllOrder(@Request() req) {
    return this.adminService.getAllOrder(req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/order/get-one')
  getOneOrder(@Request() req) {
    return this.adminService.getOneOrder(req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/order/order-product/get-all')
  getAllOrderProduct(@Request() req) {
    return this.adminService.getAllOrderProduct(req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/order/order-product/get-one')
  getOneOrderProduct(@Request() req) {
    return this.adminService.getOneOrderProduct(req);
  }

  /**
   *  Services
   */
  @UseGuards(SuperAdminAuthGuard)
  @Get('/service/get-all')
  getAllService(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {    
    return this.adminService.getAllService(page, limit, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/service/get-one')
  getServiceById(
    @Query('serviceId', ParseIntPipe) serviceId: number
  ) {    
    console.log("re");
    
    return this.adminService.getServiceById(serviceId);
  }


}
