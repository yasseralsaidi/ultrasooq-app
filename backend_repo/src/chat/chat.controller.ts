import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, Put, Patch, UseGuards, UseInterceptors, UploadedFiles, Request, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateRfqPriceRequest } from './dto/updateRfqPriceRequest.dto';
import { ParseIntPipe } from '@nestjs/common';
import { UpdateMessageStatus } from './dto/updateMessageStatus.dto';
import { AuthGuard } from 'src/guards/AuthGuard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3service } from 'src/user/s3.service';

@Controller('chat')
export class ChatController {

  constructor(
    private readonly chatService: ChatService,
    private readonly s3service: S3service
  ) { }

  @UseGuards(AuthGuard)
  @Post('/send-message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const message = await this.chatService.sendMessage(sendMessageDto);
    return message;
  }

  @UseGuards(AuthGuard)
  @Post('/createPrivateRoom')
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<{ id: number }> {
    const roomId = await this.chatService.createRoom(createRoomDto);
    return { id: roomId };
  }

  @UseGuards(AuthGuard)
  @Get('find-room')
  async checkRoom(
    @Query('rfqId', ParseIntPipe) creatorId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<{ roomId: number | null }> {
    const roomId = await this.chatService.findRoomWithBuyer(creatorId, userId);
    return { roomId };
  }

  @UseGuards(AuthGuard)
  @Get('/messages')
  async getMessages(@Query('roomId', ParseIntPipe) roomId: number) {
    try {
      const messages = await this.chatService.getMessagesByRoomId(roomId);
      return {
        status: 200,
        message: "success",
        data: messages
      };
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Could not fetch messages',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Put('/update-rfq-price-request-status')
  async updateStatus(@Body() updateRfqPriceRequest: UpdateRfqPriceRequest) {
    return this.chatService.updateRfqPriceRequestStatus(updateRfqPriceRequest);
  }

  @UseGuards(AuthGuard)
  @Patch('/read-messages')
  async markMessagesAsRead(@Body() payload: UpdateMessageStatus) {
    return this.chatService.markMessagesAsRead(payload);
  }

  @UseGuards(AuthGuard)
  @Get('/product')
  async getProduct(@Query('productId', ParseIntPipe) productId: number) {
    return this.chatService.getProductDetails(productId);
  }

  @UseGuards(AuthGuard)
  @Get('/product/messages')
  async getMessage(
    @Query('productId', ParseIntPipe) productId: number,
    @Query('sellerId', ParseIntPipe) sellerId: number,
  ) {
    return this.chatService.getMessagesByUsers(productId, sellerId);
  }

  @UseGuards(AuthGuard)
  @Post('/upload-attachment')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'content', maxCount: 1 }
  ]))
  async uploadAttachment(@UploadedFiles() files, @Request() req, @Body() payload: any) {
    return this.chatService.uploadAttachment(files, req, payload);
  }

  @UseGuards(AuthGuard)
  @Get('/download-attachment')
  async downloadFile(@Query('file-path') fileKey: string, @Request() req, @Res() res: any) {
    try {
      const presignedUrl = await this.s3service.getPresignedUrl(fileKey);
      if (presignedUrl) {
        return res.status(200).json({
          url: presignedUrl,
          message: 'Presigned URL generated successfully',
        });
      } else {
        return res.status(401).json({
          url: null,
          message: 'File is not found in S3 bucket',
        });
      }

    } catch (error) {
      return res.status(500).json({
        message: 'Failed to generate presigned URL',
      });
    }
  }
}