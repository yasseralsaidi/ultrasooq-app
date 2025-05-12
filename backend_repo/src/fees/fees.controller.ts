import { Body, Controller, Post, UseGuards, Request, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';
import { FeesService } from './fees.service';

@Controller('fees')
export class FeesController {
    constructor(private readonly feesService: FeesService) {}

    @UseGuards(SuperAdminAuthGuard)
    @Post('/createFees')
    createFees(@Body() payload: any, @Request() req) {
        return this.feesService.createFees(payload);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Patch('/updateFees')
    updateFees(@Body() payload: any, @Request() req) {
        return this.feesService.updateFees(payload);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Patch('/updateFeesDetail')
    updateFeesDetail(@Body() payload: any, @Request() req) {
        return this.feesService.updateFeesDetail(payload);
    }

    @Get('/getAllFees')
    getAllFees(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string, @Query('searchTerm') searchTerm: string) {
        return this.feesService.getAllFees(req, page, limit, sort, searchTerm);
    }

    @Get('/getOneFees')
    getOneFees(@Query('feeId') feeId: number,) {
        return this.feesService.getOneFees(feeId);
    }
    
    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deleteFees/:feeId')
    deleteFees(@Param('feeId') feeId: number, @Request() req) {
        return this.feesService.deleteFees(feeId);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deleteLocation/:id')
    deleteLocation(@Param('id') id: number, @Request() req) {
        return this.feesService.deleteLocation(id);
    }

    // not in use
    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deleteLocationFees/:id/:type')
    deleteLocationFees(@Param('id') id: number, @Request() req, @Param('type') type: string) {
        return this.feesService.deleteLocationFees(id, type);
    }

    // not in use
    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deleteLocationByType/:id/:type')
    deleteLocationByType(@Param('id') id: number, @Request() req, @Param('type') type: string) {
        return this.feesService.deleteLocationByType(id, type);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Post('/addCategoryToFees')
    addCategoryToFees(@Body() payload: any, @Request() req) {
        return this.feesService.addCategoryToFees(payload);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deleteCategoryToFees/:feesCategoryId')
    deleteCategoryToFees(@Param('feesCategoryId') feesCategoryId: number, @Request() req) {
        return this.feesService.deleteCategoryToFees(feesCategoryId);
    }

    // @Get('/getAllFeesCountry')
    // getAllFeesCountry(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string, @Query('searchTerm') searchTerm: string,
    // @Query('feeId') feeId: number) {
    //     return this.feesService.getAllFeesCountry(req, page, limit, sort, searchTerm, feeId);
    // }

}
