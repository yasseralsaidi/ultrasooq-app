
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { SuperAdminAuthGuard } from 'src/guards/SuperAdminAuthGuard';
import { AdminMemberService } from './admin-member.service';

@Controller('admin-member')
export class AdminMemberController {

  constructor(
    private readonly adminMemberService: AdminMemberService,
  ) { }

  /**
   *  Admin Role
   */

  @UseGuards(SuperAdminAuthGuard)
  @Post('/role/create')
  createAdminRole(@Request() req, @Body() payload: any) {
    return this.adminMemberService.createAdminRole(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/role/get-all')
  getAllAdminRole(@Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: number, @Request() req) {
    return this.adminMemberService.getAllAdminRole(page, limit, searchTerm, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/role/update')
  updateAdminRole(@Request() req) {
    return this.adminMemberService.updateAdminRole(req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Delete('/role/delete')
  deleteAdminRole(@Request() req) {
    return this.adminMemberService.deleteAdminRole(req);
  }

  /**
   *  Admin Permission
   */
  @UseGuards(SuperAdminAuthGuard)
  @Post('/permission/create')
  createAdminPermission(@Request() req, @Body() payload: any) {
    return this.adminMemberService.createAdminPermission(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/permission/get-all')
  getAllAdminPermission(@Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: number, @Request() req) {
    return this.adminMemberService.getAllAdminPermission(page, limit, searchTerm, req);
  }

  /**
   * Set Admin Role Permission
   */
  @UseGuards(SuperAdminAuthGuard)
  @Post('/set-permission')
  setAdminRolePermission(@Body() payload: any, @Request() req) {
    return this.adminMemberService.setAdminRolePermission(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/update-set-permission')
  updateAdminRolePermission(@Body() payload: any, @Request() req) {
    return this.adminMemberService.updateAdminRolePermission(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getAllAdminRole-with-permission')
  getAllAdminRoleWithPermission(@Query('page') page: any, @Query('limit') limit: any, @Query('searchTerm') searchTerm: any, @Request() req) {
    return this.adminMemberService.getAllAdminRoleWithPermission(page, limit, searchTerm, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/getOneAdminRole-with-permission')
  getOneAdminRoleWithPermission(@Query('adminRoleId') adminRoleId: any, @Request() req) {
    return this.adminMemberService.getOneAdminRoleWithPermission(adminRoleId);
  }

  /**
   * Admin  Member
   */
  @UseGuards(SuperAdminAuthGuard)
  @Post('/create')
  create(@Body() payload: any, @Request() req) {
    return this.adminMemberService.create(payload, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/get-all')
  getAll(@Query('page') page: any, @Query('limit') limit: any, @Request() req) {
    return this.adminMemberService.getAll(page, limit, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Get('/get-one')
  getOne(@Query('adminMemberId') adminMemberId: any, @Request() req) {
    return this.adminMemberService.getOne(adminMemberId, req);
  }

  @UseGuards(SuperAdminAuthGuard)
  @Patch('/update')
  update(@Body() payload: any, @Request() req) {
    return this.adminMemberService.update(payload, req);
  }


}
