export enum RfqProductPriceRequestStatus {
    APPROVED = "A",
    REJECTED = "R",
    PENDING = "P",
}

export enum MessageStatus {
    UNREAD,
    READ,
    DELETED
}

export interface CreatePrivateRoomRequest {
    creatorId: string;
    participants: number[];
}

export interface FindRoomRequest {
    rfqId: number;
    userId: number;
}


export interface SendMessageRequest {
    content: string;
    userId: number;
    roomId: number
}

export interface ChatHistoryRequest {
    roomId: number | null;
}

export interface RfqPriceStatusUpdateRequest {
    id: number;
    status: RfqProductPriceRequestStatus;
    userId?: number;
}


export interface UpdateMessageStatusRequest {
    userId: number;
    roomId: number;
}