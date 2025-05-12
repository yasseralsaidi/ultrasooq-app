import { Body, Controller, Post, UseGuards, Request, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';
import { PolicyService } from './policy.service';

@Controller('policy')
export class PolicyController {
    constructor(private readonly policyService: PolicyService) {}

    @UseGuards(SuperAdminAuthGuard)
    @Post('/createPolicy')
    createPolicy(@Body() payload: any, @Request() req) {
        return this.policyService.createPolicy(payload);
    }

    @UseGuards(SuperAdminAuthGuard)
    @Patch('/updatePolicy')
    updatePolicy(@Body() payload: any, @Request() req) {
        return this.policyService.updatePolicy(payload);
    }

    @Get('/getAllPolicy')
    getAllPolicy(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('sort') sort: string, @Query('searchTerm') searchTerm: string) {
        return this.policyService.getAllPolicy(req, page, limit, sort, searchTerm);
    }

    @Get('/getAllMainPolicy')
    getAllMainPolicy() {
        return this.policyService.getAllMainPolicy();
    }

    @Get('/getOnePolicy')
    getOnePolicy(@Query('policyId') policyId: number,) {
        return this.policyService.getOnePolicy(policyId);
    }
    
    @UseGuards(SuperAdminAuthGuard)
    @Delete('/deletePolicy/:policyId')
    deletePolicy(@Param('policyId') policyId: number, @Request() req) {
        return this.policyService.deletePolicy(policyId);
    }
}
