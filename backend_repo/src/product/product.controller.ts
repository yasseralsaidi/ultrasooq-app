import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { S3service } from 'src/user/s3.service';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';
import { AuthGuard } from 'src/guards/AuthGuard';
import { UpdatedProductPriceDto } from './dto/update-productPrice.dto';
import { GetOneProductPriceDto } from './dto/getOne-productPrice.dto';
import { AddMultiplePriceForProductDTO } from './dto/addMultiple-productPrice.dto';
import { UpdateMultiplePriceForProductDTO } from './dto/updateMultiple-productPrice.dto';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly s3service: S3service,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  create(@Request() req, @Body() payload: any) {
    return this.productService.create(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/update')
  update(@Request() req, @Body() payload: any) {
    return this.productService.update(payload, req);
  }

  @Post('/getProductVariant')
  getProductVariant(@Request() req, @Body() payload: any) {
    return this.productService.getProductVariant(payload, req);
  }

  @Get('/findOneProductPrice')
  findOneProductPrice(@Request() req, @Body() payload: any) {
    return this.productService.findOneProductPrice(payload, req);
  }

  // @UseGuards(SuperAdminAuthGuard)
  @Get('/findAll')
  findAll(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('userId') userId: number,
    @Query('term') term: string,
    @Query('brandIds') brandIds: any,
  ) {
    return this.productService.findAll(
      userId,
      page,
      limit,
      req,
      term,
      brandIds,
    );
  }

  // @UseGuards(SuperAdminAuthGuard)
  @Get('/findOne')
  findOne(
    @Request() req,
    @Query('productId') productId: number,
    @Query('userId') userId: number,
  ) {
    return this.productService.findOne(productId, req, userId);
  }

  @Get('/findOneWithProductPrice')
  findOneWithProductPrice(
    @Request() req,
    @Query('productId') productId: number,
    @Query('adminId') adminId: number,
    @Query('userId') userId: number,
  ) {
    return this.productService.findOneWithProductPrice(
      productId,
      adminId,
      req,
      userId,
    );
  }

  @Get('/vendorDetails')
  vendorDetails(@Query('adminId') adminId: number) {
    return this.productService.vendorDetails(adminId);
  }

  @Get('/vendorAllProduct')
  vendorAllProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('adminId') adminId: number,
    @Query('term') term: string,
    @Request() req,
    @Query('brandIds') brandIds: any,
  ) {
    return this.productService.vendorAllProduct(
      adminId,
      page,
      limit,
      req,
      brandIds,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:productId')
  delete(
    @Param('productId') productId: number,
    @Request() req,
    @Body() payload: any,
  ) {
    return this.productService.delete(productId, req);
  }

  @UseGuards(AuthGuard)
  @Post('/addPriceForProduct')
  addPriceForProduct(@Request() req, @Body() payload: any) {
    return this.productService.addPriceForProduct(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/addMultiplePriceForProduct')
  addMultiplePriceForProduct(
    @Request() req,
    @Body() payload: AddMultiplePriceForProductDTO,
  ) {
    return this.productService.addMultiplePriceForProduct(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllProductPriceByUser')
  getAllProductPriceByUser(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('term') term: string,
    @Query('brandIds') brandIds: string,
    // @Query() query: GetOneProductPriceDto
  ) {
    return this.productService.getAllProductPriceByUser(
      page,
      limit,
      req,
      term,
      brandIds,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/updateMultipleProductPrice')
  updateMultipleProductPrice(
    @Request() req,
    @Body() payload: UpdateMultiplePriceForProductDTO,
  ) {
    return this.productService.updateMultipleProductPrice(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateProductPrice')
  updateProductPrice(
    @Request() req,
    @Body() updatedProductPriceDto: UpdatedProductPriceDto,
  ) {
    return this.productService.updateProductPrice(updatedProductPriceDto, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getOneProductPrice')
  getOneProductPrice(@Query() query: GetOneProductPriceDto) {
    return this.productService.getOneProductPrice(query.productPriceId);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteOneProductPrice')
  deleteOneProductPrice(@Query() query: GetOneProductPriceDto) {
    return this.productService.deleteOneProductPrice(query.productPriceId);
  }

  @UseGuards(AuthGuard)
  @Get('/getOneProductByProductCondition')
  getOneProductByProductCondition(
    @Request() req,
    @Query('productId') productId: number,
    @Query('productPriceId') productPriceId: number,
  ) {
    return this.productService.getOneProductByProductCondition(
      productId,
      req,
      productPriceId,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/editProductPriceByProductCondition')
  editProductPriceByProductCondition(@Request() req, @Body() payload: any) {
    return this.productService.editProductPriceByProductCondition(payload, req);
  }

  // @UseGuards(AuthGuard)
  @Post('/addCountry')
  addCountry(@Request() req, @Body() payload: any) {
    return this.productService.addCountry(payload, req);
  }

  @Get('/countryList')
  countryList() {
    return this.productService.countryList();
  }

  @Post('/addLocation')
  addLocation(@Request() req, @Body() payload: any) {
    return this.productService.addLocation(payload, req);
  }

  @Get('/locationList')
  locationList() {
    return this.productService.locationList();
  }

  @Get('/getAllProduct')
  getAllProduct(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('term') term: string,
    @Query('brandIds') brandIds: any,
    @Query('priceMin') priceMin: any,
    @Query('priceMax') priceMax: any,
    @Query('userId') userId: any,
    @Query('categoryIds') categoryIds: any,
  ) {
    return this.productService.getAllProduct(
      page,
      limit,
      req,
      term,
      sort,
      brandIds,
      priceMin,
      priceMax,
      userId,
      categoryIds,
    );
  }

  @Get('/existingAllProduct')
  existingAllProduct(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('term') term: string,
    @Query('brandIds') brandIds: any,
    @Query('priceMin') priceMin: any,
    @Query('priceMax') priceMax: any,
    @Query('userId') userId: any,
    @Query('categoryIds') categoryIds: any,
    @Query('brandAddedBy') brandAddedBy: any,
  ) {
    return this.productService.existingAllProduct(
      page,
      limit,
      req,
      term,
      sort,
      brandIds,
      priceMin,
      priceMax,
      userId,
      categoryIds,
      brandAddedBy,
    );
  }

  @Get('/sameBrandAllProduct')
  sameBrandAllProduct(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('brandIds') brandIds: any,
    @Query('userId') userId: any,
    @Query('productId') productId: any,
  ) {
    return this.productService.sameBrandAllProduct(
      page,
      limit,
      req,
      brandIds,
      userId,
      productId,
    );
  }

  @Get('/relatedAllProduct')
  relatedAllProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('tagIds') tagIds: any,
    @Query('userId') userId: any,
    @Query('productId') productId: any,
  ) {
    return this.productService.relatedAllProduct(
      page,
      limit,
      tagIds,
      userId,
      productId,
    );
  }

  // ----- Product Review -----
  @UseGuards(AuthGuard)
  @Post('/addProductReview')
  addProductReview(@Request() req, @Body() payload: any) {
    return this.productService.addProductReview(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/editProductReview')
  editProductReview(@Request() req, @Body() payload: any) {
    return this.productService.editProductReview(payload, req);
  }

  @Get('/getOneProductReview')
  getOneProductReview(@Query('productReviewId') productReviewId: number) {
    return this.productService.getOneProductReview(productReviewId);
  }

  @Get('/getAllProductReview')
  getAllProductReview(
    @Query('productId') productId: any,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('sortType') sortType: any,
  ) {
    return this.productService.getAllProductReview(
      page,
      limit,
      productId,
      sortType,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/getAllProductReviewBySellerId')
  getAllProductReviewBySellerId(
    @Request() req,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('sortType') sortType: any,
  ) {
    return this.productService.getAllProductReviewBySellerId(
      page,
      limit,
      req,
      sortType,
    );
  }

  // ProductPriceReview BY User
  @UseGuards(AuthGuard)
  @Post('/addProductPriceReview')
  addProductPriceReview(@Request() req, @Body() payload: any) {
    return this.productService.addProductPriceReview(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateOneProductPriceReview')
  updateOneProductPriceReview(@Request() req, @Body() payload: any) {
    return this.productService.updateOneProductPriceReview(payload, req);
  }

  @Get('/getOneProductPriceReview')
  getOneProductPriceReview(
    @Query('productPriceReviewId') productPriceReviewId: number,
  ) {
    return this.productService.getOneProductPriceReview(productPriceReviewId);
  }

  // @UseGuards(AuthGuard)
  @Get('/getAllProductPriceReviewBySellerId')
  getAllProductPriceReviewBySellerId(
    @Request() req,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('sellerId') sellerId: any,
    @Query('sortType') sortType: any,
  ) {
    return this.productService.getAllProductPriceReviewBySellerId(
      page,
      limit,
      sellerId,
      sortType,
    );
  }

  /**
   * --------------- Question & Answer
   */

  @UseGuards(AuthGuard)
  @Post('/askQuestion')
  askQuestion(@Request() req, @Body() payload: any) {
    return this.productService.askQuestion(payload, req);
  }

  @Get('/getAllQuestion')
  getAllQuestion(
    @Query('productId') productId: any,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('sortType') sortType: any,
    @Request() req,
    @Query('userType') userType: any,
  ) {
    return this.productService.getAllQuestion(
      page,
      limit,
      productId,
      sortType,
      userType,
      req,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/giveAnswer')
  giveAnswer(@Request() req, @Body() payload: any) {
    return this.productService.giveAnswer(payload, req);
  }

  /**
   *
   *            ---- **** RFQ PRODUCT **** ----
   */
  @UseGuards(AuthGuard)
  @Get('/getAllRfqProduct')
  getAllRfqProduct(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('term') term: string,
    @Query('adminId') adminId: any,
    @Query('sortType') sortType: any,
    @Request() req,
    @Query('brandIds') brandIds: any,
  ) {
    return this.productService.getAllRfqProduct(
      page,
      limit,
      term,
      adminId,
      sortType,
      req,
      brandIds,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/addRfqProduct')
  addRfqProduct(@Request() req, @Body() payload: any) {
    return this.productService.addRfqProduct(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/editRfqProduct')
  editRfqProduct(@Request() req, @Body() payload: any) {
    return this.productService.editRfqProduct(payload, req);
  }

  // @UseGuards(AuthGuard)
  @Get('/getOneRfqProduct')
  getOneRfqProduct(@Query('rfqProductId') rfqProductId: number) {
    return this.productService.getOneRfqProduct(rfqProductId);
  }

  @UseGuards(AuthGuard)
  @Post('/addProductDuplicateRfq')
  addProductDuplicateRfq(@Request() req, @Body() payload: any) {
    return this.productService.addProductDuplicateRfq(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/allCompanyFreelancer')
  allCompanyFreelancer(@Request() req, @Body() payload: any) {
    return this.productService.allCompanyFreelancer(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/addRfqQuotes')
  addRfqQuotes(@Request() req, @Body() payload: any) {
    return this.productService.addRfqQuotes(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllRfqQuotesByBuyerID')
  getAllRfqQuotesByBuyerID(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Request() req,
  ) {
    return this.productService.getAllRfqQuotesByBuyerID(page, limit, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteOneRfqQuote')
  deleteOneRfqQuote(@Query('rfqQuotesId') rfqQuotesId: any, @Request() req) {
    return this.productService.deleteOneRfqQuote(rfqQuotesId, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllRfqQuotesUsersByBuyerID')
  getAllRfqQuotesUsersByBuyerID(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Request() req,
    @Query('rfqQuotesId') rfqQuotesId: any,
  ) {
    return this.productService.getAllRfqQuotesUsersByBuyerID(
      page,
      limit,
      req,
      rfqQuotesId,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/getOneRfqQuotesUsersByBuyerID')
  getOneRfqQuotesUsersByBuyerID(
    @Request() req,
    @Query('rfqQuotesId') rfqQuotesId: any,
  ) {
    return this.productService.getOneRfqQuotesUsersByBuyerID(req, rfqQuotesId);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllRfqQuotesUsersBySellerID')
  getAllRfqQuotesUsersBySellerID(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Request() req,
  ) {
    return this.productService.getAllRfqQuotesUsersBySellerID(page, limit, req);
  }

  @Get('/rfqFindOne')
  rfqFindOne(
    @Request() req,
    @Query('productId') productId: number,
    @Query('userId') userId: number,
  ) {
    return this.productService.rfqFindOne(productId, userId, req);
  }

  // ---- **** RFQ PRODUCT END **** ----

  // ---- **** CUSTOM FIELD FOR PRODUCT BEGINS **** ----
  @UseGuards(AuthGuard)
  @Post('/createCustomFieldValue')
  createCustomFieldValue(@Request() req, @Body() payload: any) {
    return this.productService.createCustomFieldValue(payload, req);
  }

  // ---- **** CUSTOM FIELD FOR PRODUCT ENDS **** ----

  // -------------------------------------------------------------- Factories Product Begins -------------------------------------------------------  */
  @UseGuards(AuthGuard)
  @Get('/getAllFactoriesProduct')
  getAllFactoriesProduct(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('term') term: string,
    @Query('adminId') adminId: any,
    @Query('sortType') sortType: any,
    @Request() req,
    @Query('brandIds') brandIds: any,
  ) {
    return this.productService.getAllFactoriesProduct(
      page,
      limit,
      term,
      adminId,
      sortType,
      req,
      brandIds,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/addProductDuplicateFactories')
  addProductDuplicateFactories(@Request() req, @Body() payload: any) {
    return this.productService.addProductDuplicateFactories(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/addCustomizeProduct')
  addCustomizeProduct(@Request() req, @Body() payload: any) {
    return this.productService.addCustomizeProduct(payload, req);
  }

  @UseGuards(AuthGuard)
  @Post('/createFactoriesRequest')
  createFactoriesRequest(@Request() req, @Body() payload: any) {
    return this.productService.createFactoriesRequest(payload, req);
  }

  @Get('/getAllBuyGroupProduct')
  getAllBuyGroupProduct(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    @Query('term') term: string,
    @Query('brandIds') brandIds: any,
    @Query('priceMin') priceMin: any,
    @Query('priceMax') priceMax: any,
    @Query('userId') userId: any,
    @Query('categoryIds') categoryIds: any,
  ) {
    return this.productService.getAllBuyGroupProduct(
      page,
      limit,
      req,
      term,
      sort,
      brandIds,
      priceMin,
      priceMax,
      userId,
      categoryIds,
    );
  }

  /**
   * Seller Reward
   */
  @UseGuards(AuthGuard)
  @Post('/createSellerRewardProduct')
  createSellerRewardProduct(@Request() req, @Body() payload: any) {
    return this.productService.createSellerRewardProduct(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllSellerReward')
  getAllSellerReward(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('term') term: string,
  ) {
    return this.productService.getAllSellerReward(page, limit, term, req);
  }

  /**
   * Generate Link
   */
  @UseGuards(AuthGuard)
  @Post('/generateLink')
  generateLink(@Request() req, @Body() payload: any) {
    return this.productService.generateLink(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllGenerateLink')
  getAllGenerateLink(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('term') term: string,
  ) {
    return this.productService.getAllGenerateLink(page, limit, term, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllGenerateLinkBySellerRewardId')
  getAllGenerateLinkBySellerRewardId(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('term') term: string,
  ) {
    return this.productService.getAllGenerateLinkBySellerRewardId(
      page,
      limit,
      term,
      req,
    );
  }

  /***
   *  DELETE ALL PRODUCT ONLY USED BY BACKEND MANUALLY
   */
  @Post('/deleteProductFromBackend')
  deleteProductFromBackend(@Request() req, @Body() payload: any) {
    return this.productService.deleteProductFromBackend(req);
  }
}
