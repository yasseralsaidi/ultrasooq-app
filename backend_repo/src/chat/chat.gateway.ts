import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRfqPriceRequest } from './dto/updateRfqPriceRequest.dto';

@WebSocketGateway({ namespace: '/ws', cors: "*" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap: Map<number, string> = new Map();

  constructor(private readonly chatService: ChatService) { }

  afterInit() {
    // Pass the server to the chatService
    this.chatService.setServer(this.server);
  }

  @SubscribeMessage('createPrivateRoom')
  async handleCreateRoom(@MessageBody() createRoomDto: CreateRoomDto, @ConnectedSocket() client: Socket) {
    try {
      const roomId = await this.chatService.createRoom(createRoomDto);

      // Add the sender to the room
      client.join(roomId.toString());

      for (const participantId of createRoomDto.participants) {
        // Skip the creator if they are in the participants list
        if (participantId === createRoomDto.creatorId) continue;

        const participantSocketId = this.userSocketMap.get(participantId);
        if (participantSocketId) {
          client.to(participantSocketId).socketsJoin(roomId.toString());
        }
      }

      // Notify user that a room created
      this.server.to(roomId.toString()).emit('newRoomCreated', { roomId, creatorId: createRoomDto.creatorId })

      // Send the initial message if provided
      if (createRoomDto.content || createRoomDto?.attachments?.length > 0) {
        const sendMessageDto: SendMessageDto = {
          roomId: roomId,
          content: createRoomDto.content,
          userId: createRoomDto.creatorId,
          rfqId: createRoomDto.rfqId,
          rfqQuoteProductId: createRoomDto.rfqQuoteProductId,
          buyerId: createRoomDto.buyerId,
          sellerId: createRoomDto.sellerId,
          requestedPrice: createRoomDto.requestedPrice,
          rfqQuotesUserId: createRoomDto.rfqQuotesUserId,
          attachments: createRoomDto.attachments
        };
        const newMessage = await this.chatService.sendMessage(sendMessageDto);
        const message = {
          id: newMessage.id,
          content: newMessage.content,
          userId: newMessage.userId,
          roomId: newMessage.roomId,
          rfqId: newMessage.rfqId,
          user: newMessage.user,
          participants: newMessage.participants,
          rfqProductPriceRequest: newMessage.rfqPPRequest,
          rfqQuotesUserId: newMessage.rfqQuotesUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          uniqueId: createRoomDto.uniqueId
        };

        // save the attachments in draft
        if (createRoomDto?.attachments?.length) {
          const newData = createRoomDto?.attachments.map((att: any) => ({ ...att, messageId: message?.id }))
          const payload = {
            attachments: newData
          }
          await this.chatService.saveAttachmentMessage(payload);
        }
        // Emit the message to the specified room
        this.server.to(roomId.toString()).emit('receivedMessage', message);
      }
    } catch (error) {
      console.log(error)
      client.emit('createPrivateRoomError', { message: 'Failed to create a private room', status: 500 });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() sendMessageDto: SendMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const newMessage = await this.chatService.sendMessage(sendMessageDto);
      let message = {
        id: newMessage.id,
        content: newMessage.content,
        userId: newMessage.userId,
        roomId: newMessage.roomId,
        rfqId: newMessage.rfqId,
        user: newMessage.user,
        participants: newMessage.participants,
        rfqProductPriceRequest: newMessage.rfqPPRequest,
        rfqQuotesUserId: newMessage.rfqQuotesUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        uniqueId: sendMessageDto.uniqueId
      };
      // save the attachments in draft
      if (sendMessageDto?.attachments?.length) {
        const newData = sendMessageDto?.attachments.map((att: any) => ({ ...att, messageId: message?.id }))
        const payload = {
          attachments: newData
        }
        await this.chatService.saveAttachmentMessage(payload);
      }

      this.server.to(sendMessageDto.roomId.toString()).emit('receivedMessage', message);

    } catch (error) {
      // console.log(error)
      client.emit('sendMessageError', { message: 'Failed to send message', status: 500 });
    }
  }

  @SubscribeMessage('updateRfqPriceRequest')
  async handleUpdateRfqRequestPrice(@MessageBody() updateRfqPriceRequest: UpdateRfqPriceRequest, @ConnectedSocket() client: Socket) {
    try {
      let newTotalOfferPrice: number = 0;
      // UPDATE THE OFFER PRICE THE THE STATUS IF APPROVED
      if (updateRfqPriceRequest.status === "A") {
        const payload = {
          id: updateRfqPriceRequest.rfqQuoteProductId,
          offerPrice: updateRfqPriceRequest.requestedPrice,
          rfqUserId: updateRfqPriceRequest.rfqUserId
        }
        const updatedRfqUser = await this.chatService.updateRfqQuotesProductsOfferPrice(payload);
        newTotalOfferPrice = updatedRfqUser.newTotalOfferPrice;
      }

      const updatedRe = await this.chatService.updateRfqPriceRequestStatus(updateRfqPriceRequest);
      const rfqRequest = {
        id: updatedRe.id,
        messageId: updatedRe.messageId,
        rfqQuoteProductId: updatedRe.rfqQuoteProductId,
        status: updatedRe.status,
        requestedPrice: updatedRe.requestedPrice,
        requestedById: updatedRe.requestedById,
        newTotalOfferPrice,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.server.to(updateRfqPriceRequest.roomId.toString()).emit('updatedRfqPriceRequest', rfqRequest);
    } catch (error) {
      client.emit('updateRfqPriceRequestError', { message: 'Failed to update status', status: 500 });
    }
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string, 10);
    console.log(`Client connected: ${client.id} with userId: ${userId}`);

    if (userId) {
      this.userSocketMap.set(userId, client.id);
      const rooms = await this.chatService.getRoomsForUser(userId);
      rooms.forEach((room: number) => client.join(room.toString()));
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSocketMap.keys()).find(key => this.userSocketMap.get(key) === client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }
} 