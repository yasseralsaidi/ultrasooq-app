import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus, UploadedFiles, Request, Body } from '@nestjs/common';
import { PrismaClient, RfqProductPriceRequestStatus } from '@prisma/client';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateRfqPriceRequest } from './dto/updateRfqPriceRequest.dto';
import { UpdateRfqQuotesProductsOfferPrice } from './dto/updateRfqQuotesProductsOfferPrice.dto';
import { UpdateMessageStatus } from './dto/updateMessageStatus.dto';
import { SaveAttachmentsDto } from './dto/save-attachment.dto';
import { S3service } from 'src/user/s3.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

@Injectable()
export class ChatService {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly s3service: S3service,
    ) { }

    setServer(server: Server) {
        this.server = server;
    }

    private mapStatus(status: string): RfqProductPriceRequestStatus {
        switch (status) {
            case 'A':
                return RfqProductPriceRequestStatus.APPROVED;
            case 'R':
                return RfqProductPriceRequestStatus.REJECTED;
            case 'P':
                return RfqProductPriceRequestStatus.PENDING;
            default:
                throw new BadRequestException(`Invalid status value: ${status}`);
        }
    }

    async sendMessage(sendMessageDto: SendMessageDto) {
        const { content, userId, roomId, rfqId, requestedPrice, rfqQuoteProductId, buyerId, sellerId, rfqQuotesUserId } = sendMessageDto;
        let rfqPPRequest = null;
        const message = await prisma.message.create({
            data: {
                content,
                userId,
                roomId,
                rfqId,
                rfqQuotesUserId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
        });

        if (rfqQuoteProductId && rfqQuotesUserId) {
            const res = await prisma.rfqQuoteProductPriceRequest.create({
                data: {
                    rfqQuoteProductId: rfqQuoteProductId,
                    rfqQuotesUserId,
                    messageId: message.id,
                    requestedById: userId,
                    requestedPrice: requestedPrice,
                    buyerId: buyerId || null,
                    sellerId: sellerId || null,
                    rfqQuoteId: rfqId || null
                },
            });

            rfqPPRequest = {
                id: res.id,
                requestedPrice: res.requestedPrice,
                status: res.status,
                rfqQuoteProductId: res.rfqQuoteProductId,
                requestedById: res.requestedById,
                updatedAt: res.updatedAt
            }
        }

        const roomParticipants = await prisma.roomParticipants.findMany({
            where: { roomId },
            select: { userId: true },
        });

        const readStatusData = roomParticipants
            .filter(participant => participant.userId !== userId)
            .map(participant => ({
                messageId: message.id,
                userId: participant.userId,
            }));

        return {
            ...message,
            rfqPPRequest,
            rfqQuotesUserId,
            participants: roomParticipants.map((participant) => participant.userId)
        };
    }

    async saveAttachmentMessage(saveAttachmentsDto: SaveAttachmentsDto) {
        const { attachments } = saveAttachmentsDto;

        const createdAttachments = await prisma.chatAttachments.createMany({
            data: attachments.map(attachment => ({
                fileName: attachment.fileName,
                filePath: attachment.filePath,
                fileSize: attachment.fileSize,
                fileType: attachment.fileType,
                fileExtension: attachment.fileExtension,
                messageId: attachment.messageId,
                status: attachment.status,
                uniqueId: attachment.uniqueId
            })),
            skipDuplicates: true,
        });

        return createdAttachments;
    }

    async getRoomsForUser(userId: number) {
        try {
            const roomParticipants = await prisma.roomParticipants.findMany({
                where: { userId },
                select: { roomId: true },
            });
            const roomIds = roomParticipants.map((participant) => participant.roomId);
            return roomIds;
        } catch (error) {
            return []
        }
    }

    async createRoom(createRoomDto: CreateRoomDto): Promise<number> {
        const { participants, creatorId, rfqId } = createRoomDto;
        const room = await prisma.room.create({
            data: {
                creatorId,
                rfqId,
                participants: {
                    create: participants.map(userId => ({ userId })),
                },
            },
            include: { participants: true },
        });
        return room.id;
    }

    async findRoomWithBuyer(rfqId: number, userId: number): Promise<number | null> {
        const room = await prisma.room.findFirst({
            where: {
                rfqId,
                participants: {
                    some: {
                        userId: userId,
                    },
                },
            },
            select: {
                id: true,
            },
        });
        return room ? room.id : null;
    }

    async getMessagesByRoomId(roomId: number): Promise<any[]> {
        const messages = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                content: true,
                createdAt: true,
                userId: true,
                roomId: true,
                rfqQuotesUserId: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                rfqProductPriceRequest: {
                    select: {
                        id: true,
                        status: true,
                        requestedPrice: true,
                        rfqQuoteProductId: true
                    }
                },
                attachments: {
                    select: {
                        id: true,
                        status: true,
                        fileName: true,
                        filePath: true,
                        presignedUrl: true,
                        fileType: true
                    }
                }
            }
        });

        const updatedMessages = await Promise.all(messages.map(async (message) => {
            if (message.attachments) {
                message.attachments = await Promise.all(message.attachments.map(async (attachment) => {
                    if (attachment.filePath) {
                        const presignedUrl = await this.s3service.getPresignedUrl(attachment.filePath);;
                        if (presignedUrl) attachment.presignedUrl = presignedUrl
                        else attachment.presignedUrl = null
                    }
                    return attachment;
                }));
            }
            return message;
        }));

        return updatedMessages;
    }

    async updateRfqPriceRequestStatus(updateRfqPriceRequest: UpdateRfqPriceRequest) {
        try {
            const { id, status, userId } = updateRfqPriceRequest;
            const mappedStatus = this.mapStatus(status);
            let approvedById: number | null = null;
            let rejectedById: number | null = null;

            const rfq = await prisma.rfqQuoteProductPriceRequest.findUnique({
                where: { id },
            });

            if (!rfq) {
                throw new NotFoundException(`RfqQuoteProductPriceRequest with ID ${id} not found`);
            }

            if (status === "A") {
                approvedById = userId
            } else if (status === "R") {
                rejectedById = userId
            }
            return prisma.rfqQuoteProductPriceRequest.update({
                where: { id },
                data: { status: mappedStatus, approvedById, rejectedById },
            });
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal server error',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateRfqQuotesProductsOfferPrice(updateRfqQuotesProductsOfferPrice: UpdateRfqQuotesProductsOfferPrice) {
        try {
            const { id, offerPrice, rfqUserId } = updateRfqQuotesProductsOfferPrice;

            const rfq = await prisma.rfqQuotesProducts.findUnique({
                where: { id },
            });

            const rfqUser = await prisma.rfqQuotesUsers.findUnique({
                where: { id: rfqUserId },
                select: {
                    id: true,
                    offerPrice: true
                }
            });

            const isAlreadyPriceRequested = await prisma.rfqQuoteProductPriceRequest.findFirst({
                where: {
                    rfqQuoteProductId: id,
                    rfqQuotesUserId: rfqUserId,
                    status: "APPROVED"
                },
                select: {
                    id: true,
                    requestedPrice: true
                },
                orderBy: {
                    id: "desc"
                }
            });
            if (!rfq) {
                throw new NotFoundException(`RfqQuotesProducts with ID ${id} not found`);
            }

            if (rfq.quantity) {
                let requestedProductTotal = 0;
                const currentTotalPrice: any = rfqUser.offerPrice;
                const requestedProductCurrentPrice: any = rfq?.offerPrice;

                if (isAlreadyPriceRequested?.requestedPrice) {
                    requestedProductTotal = isAlreadyPriceRequested?.requestedPrice * rfq.quantity
                } else {
                    requestedProductTotal = requestedProductCurrentPrice * rfq.quantity
                }

                // subtract the requested product total price from the total price
                let subtractedTotalAmount = currentTotalPrice - requestedProductTotal;
                if (subtractedTotalAmount < 0) {
                    subtractedTotalAmount = requestedProductTotal - currentTotalPrice;
                }
                // Addition the new requested price by the quantity
                const newRequestedTotalAmount = offerPrice * rfq.quantity;

                const newTotalAmount: number = subtractedTotalAmount + newRequestedTotalAmount;

                await prisma.rfqQuotesUsers.update({
                    where: { id: rfqUserId },
                    data: { offerPrice: newTotalAmount },
                });
                return {
                    newTotalOfferPrice: newTotalAmount
                }
            } else {
                throw new NotFoundException(`Quantity not found`);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async markMessagesAsRead(payload: UpdateMessageStatus) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const updatedMessages = await prisma.message.updateMany({
                where: {
                    userId: payload.userId,
                    roomId: payload.roomId,
                    status: 'UNREAD',
                },
                data: {
                    status: 'READ',
                },
            });

            return {
                status: HttpStatus.OK,
                message: 'Messages updated successfully',
                data: updatedMessages,
            };
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal server error',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getProductDetails(productId: number) {
        try {
            const product = await prisma.product.findFirst({
                where: { id: productId },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    productName: true,
                    skuNo: true,
                    productPrice: true,
                    offerPrice: true,
                    adminId: true,
                    userId: true,
                    productImages: {
                        where: {
                            status: "ACTIVE"
                        },
                        select: {
                            id: true,
                            image: true
                        },
                        take: 1
                    },
                    product_productPrice: {
                        where: {
                            status: 'ACTIVE',
                        },
                        select: {
                            adminDetail: {
                                select: {
                                    id: true
                                }
                            }
                        },
                        orderBy: {
                            offerPrice: 'asc'
                        },
                        take: 1
                    }
                }
            });
            if (!product) {
                throw new NotFoundException(`Product not found`);
            }

            return {
                status: HttpStatus.OK,
                data: product,
            };
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal server error',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMessagesByUsers(productId: number, sellerId: number) {
        try {
            const messages = await prisma.message.findMany({
                where: {
                    rfqId: productId,
                    userId: {
                        not: sellerId
                    }
                },
                distinct: ['userId'],
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true
                        }
                    },
                    room: {
                        select: {
                            id: true
                        }
                    },
                }
            });

            const messagesWithMessageCount = await Promise.all(
                messages.map(async (message) => {
                    const unreadMsgCount = await prisma.message.count({
                        where: {
                            rfqId: productId,
                            userId: message.userId,
                            status: "UNREAD",
                        },
                    });

                    return {
                        ...message,
                        unreadMsgCount
                    };
                })
            );

            return {
                status: HttpStatus.OK,
                data: messagesWithMessageCount,
            };
        } catch (error) {
            console.log(error.message)
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal server error',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAttachmentStatus(payload: { uniqueId: string, path: string }) {
        try {
            const attachment = await prisma.chatAttachments.findUnique({
                where: { uniqueId: payload.uniqueId },
                select: {
                    fileName: true,
                    fileType: true,
                    message: {
                        select: {
                            roomId: true,
                            userId: true,
                            room: {
                                select: {
                                    creatorId: true
                                }
                            }
                        }
                    }
                },
            });

            if (!attachment) {
                throw new Error('Attachment not found');
            }

            const updatedAttachment = await prisma.chatAttachments.update({
                where: {
                    uniqueId: payload.uniqueId,
                },
                data: {
                    status: 'UPLOADED',
                    filePath: payload.path
                },
            });
            return {
                status: 200,
                data: {
                    roomId: attachment.message.roomId.toString(),
                    senderId: attachment.message.userId,
                    uniqueId: updatedAttachment.uniqueId,
                    status: updatedAttachment.status,
                    messageId: updatedAttachment.messageId,
                    fileName: attachment.fileName,
                    fileType: attachment.fileType
                }
            };
        } catch (error) {
            console.log(error)
            return {
                status: 500
            }
        }
    }

    async uploadAttachment(@UploadedFiles() files, @Request() req, @Body() payload: any) {
        try {
            if (files.content) {
                const currentFile = Date.now() + "_" + files?.content[0]?.originalname
                const path = "public/" + req.user.id + "/" + currentFile
                await this.s3service.s3_upload(files.content[0].buffer, path, files.content[0].mimetype);

                if (payload?.uniqueId) {
                    const res = await this.updateAttachmentStatus({ uniqueId: payload?.uniqueId, path: path });
                    if (res?.status !== 500 && res?.data) {
                        ///Emit socket event after successful update
                        const presignedUrl = await this.s3service.getPresignedUrl(path);

                        this.server.to(res?.data?.roomId).emit('newAttachment', {
                            uniqueId: res?.data.uniqueId,
                            status: res?.data.status,
                            messageId: res?.data.messageId,
                            roomId: res?.data.roomId,
                            senderId: res?.data.senderId,
                            fileName: res?.data.fileName,
                            fileType: res?.data.fileType,
                            filePath: path,
                            presignedUrl
                        });
                        return {
                            status: HttpStatus.OK,
                            message: 'Uploading completed',
                        };
                    }
                    return {
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: 'Internal server error',
                    };
                }
                return {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'UniqueId is required',
                };
            } else {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'attachment not found',
                };
            }
        } catch (error) {
            console.log("lisa", error)
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal server error',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
