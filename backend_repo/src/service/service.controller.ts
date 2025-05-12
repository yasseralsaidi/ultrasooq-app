import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { ServiceService } from './service.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';

@Controller('service')
@UseGuards(AuthGuard)
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post('create')
  createService(@Body() dto: CreateServiceDto, @GetUser('id') userId: number) {
    return this.service.createService(dto, userId);
  }

  @Get('list')
  getAllServices(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('ownservice', new DefaultValuePipe(false), ParseBoolPipe)
    ownService: boolean,
    @GetUser('id') userId: number,
    @Query('term') term: string,
    @Query('sort') sort: string,
  ) {
    return this.service.getAllServices(page, limit, ownService, userId, term, sort);
  }

  @Get('getAllServiceBySeller')
  getAllServiceBySeller(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sellerId') sellerId: string,
  ) {
    console.log(sellerId, page, limit);

    return this.service.getAllServiceBySeller(sellerId, page, limit, req);
  }

  @Get('getAllServiceOfOtherSeller')
  getAllServiceOfOtherSeller(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sellerId') sellerId: string,
  ) {
    console.log(sellerId, page, limit);

    return this.service.getAllServiceOfOtherSeller(sellerId, page, limit, req);
  }

  @Get('getAllServiceRelatedProductCategoryId')
  getAllServiceRelatedProductCategoryId(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('categoryId') categoryId: string,
  ) {
    console.log(categoryId, page, limit);
    
    return this.service.getAllServiceRelatedProductCategoryId(categoryId, page, limit, req);
  }

  @Get(':serviceid')
  getServiceById(@Param('serviceid', ParseIntPipe) serviceId: number) {
    return this.service.getServiceById(serviceId);
  }

  @Patch(':serviceid')
  updateService(
    @Param('serviceid', ParseIntPipe) serviceId: number,
    @Body() dto: UpdateServiceDto,
    @GetUser('id') userId: number,
  ) {
    return this.service.updateService(serviceId, userId, dto);
  }

  @Get('product/:serviceid')
  getProductService(
    @Param('serviceid', ParseIntPipe) serviceId: number,
    @GetUser('id') userId: number,
  ) {
    return this.service.getProductService(serviceId, userId);
  }
}
