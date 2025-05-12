import { Body, Controller, Get, Post, UseGuards, Request, UploadedFiles, UseInterceptors, Patch, Query, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/guards/AuthGuard';
import { RegisterValidateOtp } from './dto/registerValidateOtp.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3service } from './s3.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly s3service: S3service,
    ) {}

    @Post('/register') 
    register(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Post('/registerValidateOtp') 
    registerValidateOtp(@Body() payload: RegisterValidateOtp) {
        return this.userService.registerValidateOtp(payload);
    }

    @Post('/resendOtp') 
    resendOtp(@Body() payload: any) {
        return this.userService.resendOtp(payload);
    }

    @Post('/login') 
    login(@Body() payload: any) {
        return this.userService.login(payload);
    }

    @Post('/socialLogin') 
    socialLogin(@Body() payload: any) {
        return this.userService.socialLogin(payload);
    }

    @UseGuards(AuthGuard)
    @Post('/me') 
    me(@Request() req, @Body() payload: any) {
        return this.userService.me(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/get-perrmision') 
    getPermission(@Request() req, @Body() payload: any) {
        return this.userService.getPermission(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/userProfile') 
    userProfile(@Request() req, @Body() payload: any) {
        return this.userService.userProfile(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/userProfileFile') 
    // @UseInterceptors(FileFieldsInterceptor([]))
    // userProfileFile(@UploadedFiles() files,@Request() req, @Body() payload: any) {
    userProfileFile(@UploadedFiles() files, @Body() payload: any) {
        console.log('payload: ', payload);
        return true
        // return this.userService.userProfile(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/updateUserProfile') 
    updateUserProfile(@Request() req, @Body() payload: any) {
        return this.userService.updateUserProfile(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/presignedUrlUpload') 
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'content', maxCount: 1 }
    ]))
    presignedUrlUpload(@UploadedFiles() files, @Request() req, @Body() payload: any){
        if (files.content) {
            // console.log('files: ', files.content);
            const currentFile = Date.now() + "_" + files?.content[0]?.originalname
            const path = "public/" + req.user.id + "/" + currentFile
            return this.s3service.s3_upload(files.content[0].buffer, path, files.content[0].mimetype)
        }
    }

    @UseGuards(AuthGuard)
    @Post('/presignedUrlUploadMultiple') 
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'content', maxCount: 50 }
    ]))
    async presignedUrlUploadMultiple(@UploadedFiles() files, @Request() req, @Body() payload: any){
        let resourceFileData = []

        if (files.content && files.content.length > 0) {
            for (let i=0; i<files.content.length; i++) {
                const currentFile = Date.now() + "_" + files?.content[i]?.originalname
                const path = "public/" + req.user.id + "/" + currentFile
                // return this.s3service.s3_uploadMulti(files.content[i].buffer, path, files.content[0].mimetype)
                const url = await this.s3service.s3_uploadMulti(files.content[i].buffer, path, files.content[i].mimetype);

                // Add the URL to resourceFileData
                resourceFileData.push(url);
            }
        }
        return {
            status: true,
            message: "Upload Successfully",
            data: resourceFileData,
            uniqueId: payload?.uniqueId || null
        };
    }

    @UseGuards(AuthGuard)
    @Post('/presignedUrlDelete') 
    async presignedUrlDelete(@Request() req, @Body() payload: any) {
        console.log('presignedUrlDelete: Controller');
        
        return this.userService.presignedUrlDelete(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/updateProfile')
    @UseInterceptors(FileFieldsInterceptor([]))
    updateProfile(@UploadedFiles() files, @Request() req, @Body() payload: any) {
        return this.userService.updateProfile(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/changePassword') 
    changePassword(@Request() req, @Body() payload: any) {
        return this.userService.changePassword(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/findAll') 
    findAll() {
        return this.userService.findAll();
    }

    @Post('/findUnique') 
    findUnique(@Body() payload: any) {
        return this.userService.findUnique(payload);
    }

    @UseGuards(AuthGuard)
    @Post('/addUserPhone')
    addUserPhone(@Request() req, @Body() payload: any) {
        return this.userService.addUserPhone(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/addUserSocialLink')
    addUserSocialLink(@Request() req, @Body() payload: any) {
        return this.userService.addUserSocialLink(payload, req);
    }

    @Post('/viewOneUserPhone')
    viewOneUserPhone(@Body() payload: any) {
        return this.userService.viewOneUserPhone(payload);
    }

    @Post('/forgetPassword')
    forgetPassword(@Body() payload: any) {
        return this.userService.forgetPassword(payload);
    }

    @Post('/verifyOtp')
    verifyOtp(@Body() payload: any) {
        return this.userService.verifyOtp(payload);
    }

    @UseGuards(AuthGuard)
    @Post('/resetPassword')
    resetPassword(@Request() req, @Body() payload: any) {
        return this.userService.resetPassword(payload, req);
    }

    @Get('/viewTags')
    viewTags(@Body() payload: any) {
        return this.userService.viewTags();
    }

    @UseGuards(AuthGuard)
    @Post('/createTag')
    createTag(@Request() req, @Body() payload: any) {
        return this.userService.createTag(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/updateBranch')
    updateBranch(@Request() req, @Body() payload: any) {
        return this.userService.updateBranch(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/onlineoffline')
    onlineOfflineStatus(@Request() req, @Body() payload: any) {
        return this.userService.onlineOfflineStatus(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/changeEmail')
    changeEmail(@Request() req, @Body() payload: any) {
        return this.userService.changeEmail(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/verifyEmail')
    verifyEmail(@Request() req, @Body() payload: any) {
        return this.userService.verifyEmail(payload, req);
    }

    @UseGuards(AuthGuard)
    @Post('/addBranch')
    AddBranch(@Request() req, @Body() payload: any) {
        return this.userService.addBranchAfterEdit(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/findOneBranch') 
    findOneBranch(@Query('branchId') branchId: number, @Request() req) {
        return this.userService.findOneBranch( branchId, req);
    }

    @UseGuards(AuthGuard)
    @Post('/addUserAddress') 
    addUserAddress(@Request() req, @Body() payload: any) {
        return this.userService.addUserAddress(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/updateUserAddress') 
    updateUserAddress(@Request() req, @Body() payload: any) {
        return this.userService.updateUserAddress(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/getAllUserAddress') 
    getAllUserAddress(@Query('page') page: number, @Query('limit') limit: number, @Request() req) {
        return this.userService.getAllUserAddress( page, limit, req);
    }

    @UseGuards(AuthGuard)
    @Get('/getOneUserAddress') 
    getOneUserAddress(@Query('userAddressId') userAddressId: number, @Request() req) {
        return this.userService.getOneUserAddress(userAddressId);
    }

    @UseGuards(AuthGuard)
    @Delete('/deleteUserAddress') 
    deleteUserAddress(@Query('userAddressId') userAddressId: number, @Request() req) {
        return this.userService.deleteUserAddress(userAddressId, req);
    }

    @Post('/userDelete') 
    userDelete(@Body() payload: any) {
        return this.userService.userDelete(payload);
    }

    /**
     * 
        User ROle
     */

    @UseGuards(AuthGuard)
    @Post('/createUserRole') 
    createUserRole(@Body() payload: any, @Request() req) {
        return this.userService.createUserRole(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/getAllUserRole') 
    getAllUserRole(@Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: number, @Request() req) {
        return this.userService.getAllUserRole(page, limit, searchTerm, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/updateUserRole') 
    updateUserRole(@Request() req) {
        return this.userService.updateUserRole(req);
    }

    @UseGuards(AuthGuard)
    @Delete('/deleteUserRole') 
    deleteUserRole(@Request() req) {
        return this.userService.deleteUserRole(req);
    }

    /**
     * Set Permission
     */
    @UseGuards(AuthGuard)
    @Post('/set-permision') 
    setPermission(@Body() payload: any, @Request() req) {
        return this.userService.setPermission(payload, req);
    }

    @UseGuards(AuthGuard)
    @Patch('/update-set-permission') 
    updateSetPermission(@Body() payload: any, @Request() req) {
        return this.userService.updateSetPermission(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/getAllUserRole-with-permission')
    getAllUserRoleWithPermission(@Query('page') page: any, @Query('limit') limit: any, @Query('searchTerm') searchTerm: any, @Request() req) {
        return this.userService.getAllUserRoleWithPermission(page, limit, searchTerm, req);
    }

    @UseGuards(AuthGuard)
    @Get('/getOneUserRole-with-permission')
    getOneUserRoleWithPermission(@Query('userRoleId') userRoleId: any, @Request() req) {
        return this.userService.getOneUserRoleWithPermission(userRoleId);
    }

    @UseGuards(AuthGuard)
    @Patch('/copy-userRole-with-permission') 
    copyUserRoleWithPermission(@Body() payload: any, @Request() req) {
        return this.userService.copyUserRoleWithPermission(payload, req);
    }


    /**
     * Help Center
     */
    @Post('/help-center/create') 
    createHelpCenter(@Body() payload: any, @Request() req) {
        return this.userService.createHelpCenter(payload, req);
    }

    @UseGuards(AuthGuard)
    @Get('/help-center/get-all/')
    getAllHelpCenterResponse(@Request() req, @Query('page') page: number, @Query('limit') limit: number, @Query('searchTerm') searchTerm: string) {
        return this.userService.getAllHelpCenterResponse(page, limit, searchTerm, req);
    }
}
