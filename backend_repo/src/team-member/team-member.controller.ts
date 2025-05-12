
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/AuthGuard';
import { TeamMemberService } from './team-member.service';

@Controller('team-member')
export class TeamMemberController {

  constructor(
    private readonly teamMemberService: TeamMemberService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/create') 
  create(@Request() req, @Body() payload: any) {
    return this.teamMemberService.create(payload, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/update') 
  update(@Request() req, @Body() payload: any) {
    return this.teamMemberService.update(payload, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getAllTeamMember') 
  getAllTeamMember(@Query('page') page: number, @Query('limit') limit: number, @Request() req) {
    return this.teamMemberService.getAllTeamMember(page, limit, req);
  }

  @UseGuards(AuthGuard)
  @Get('/getOneTeamMember') 
  getOneTeamMember(@Query('memberId') memberId: number, @Request() req) {
    return this.teamMemberService.getOneTeamMember(memberId, req);
  }

}
