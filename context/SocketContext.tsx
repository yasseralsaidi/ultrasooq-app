"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { MessageStatus } from "@/utils/types/chat.types";

interface newMessageType {
  content: string;
  userId: number;
  roomId: number;
  rfqId: number;
  createdAt: string;
}
export interface newAttachmentType {
  uniqueId: string;
  status: string;
  messageId: number;
  roomId: number;
  senderId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  presignedUrl: string;
}
interface rfqRequestType {
  id: number;
  messageId: number;
  rfqQuoteProductId: number;
  status: string;
  requestedPrice: number;
  requestedById: number;
  newTotalOfferPrice: number;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (message: {
    roomId: number;
    rfqId: number;
    content: string;
    rfqQuoteProductId?: number;
    buyerId?: number;
    sellerId?: number;
    requestedPrice?: number;
    rfqQuotesUserId?: number | null;
    attachments?: any[],
    uniqueId: number
  }) => void;
  newMessage: newMessageType | null;
  errorMessage: string;
  clearErrorMessage: () => void;
  newRoom: {
    roomId: number,
    creatorId: number,
  };
  newAttachment: newAttachmentType | null;
  cratePrivateRoom: (newRoom: {
    participants: number[];
    content: string;
    rfqId: number;
    rfqQuoteProductId?: number;
    buyerId?: number;
    sellerId?: number;
    requestedPrice?: number;
    rfqQuotesUserId?: number | null;
    attachments?: any[],
    uniqueId: number
  }) => void;
  updateRfqRequestStatus: (rfqRequest: {
    roomId: number | null;
    id: number;
    status: string;
    rfqUserId: number;
    requestedPrice: number;
    rfqQuoteProductId: number
  }) => void;
  rfqRequest: rfqRequestType | null;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newMessage, setNewMessage] = useState<newMessageType | null>(null);
  const [newAttachment, setNewAttachment] = useState<newAttachmentType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newRoom, setNewRoom] = useState<any | null>(null);
  const [rfqRequest, setRfqRequest] = useState<rfqRequestType | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const socketIo = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        query: { userId: user.id },
      });

      socketIo.on("connect", () => {
        setConnected(true);
        console.log("Connected to socket server");
      });

      socketIo.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from socket server");
      });

      socketIo.on("receivedMessage", (message: newMessageType) => {
        setNewMessage(message);
      });

      socketIo.on("newRoomCreated", (room: { roomId: number, creatorId: number }) => {
        setNewRoom(room);
      });

      socketIo.on("newAttachment", (attachment: newAttachmentType) => {
        setNewAttachment(attachment);
      });

      socketIo.on(
        "updatedRfqPriceRequest",
        (rfqRequest: {
          id: number;
          messageId: number;
          rfqQuoteProductId: number;
          status: string;
          requestedPrice: number;
          requestedById: number;
          newTotalOfferPrice: number;
        }) => {
          setRfqRequest(rfqRequest);
        },
      );
      // ERROR MESSAGES
      socketIo.on("createPrivateRoomError", (error: { message: string }) => {
        setErrorMessage("Failed");
      });

      socketIo.on("sendMessageError", (error: { message: string }) => {
        setErrorMessage("Failed");
      });

      socketIo.on(
        "updateRfqPriceRequestError",
        (error: { message: string }) => {
          setErrorMessage("Failed");
        },
      );

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
        setNewRoom(null);
        setErrorMessage("");
        setNewMessage(null);
        setRfqRequest(null);
        setNewAttachment(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const sendMessage = ({
    roomId,
    content,
    rfqId,
    rfqQuoteProductId,
    requestedPrice,
    buyerId,
    sellerId,
    rfqQuotesUserId,
    attachments,
    uniqueId
  }: {
    roomId: number;
    rfqId: number;
    content: string;
    rfqQuoteProductId?: number;
    buyerId?: number;
    sellerId?: number;
    requestedPrice?: number;
    rfqQuotesUserId?: number | null;
    attachments?: any[],
    uniqueId: number
  }) => {
    if (socket) {
      socket.emit("sendMessage", {
        roomId,
        rfqId,
        content,
        userId: user?.id,
        rfqQuoteProductId,
        buyerId,
        sellerId,
        requestedPrice,
        rfqQuotesUserId,
        attachments,
        uniqueId
      });
    }
  };

  const cratePrivateRoom = ({
    participants,
    content,
    rfqId,
    rfqQuoteProductId,
    buyerId,
    sellerId,
    requestedPrice,
    rfqQuotesUserId,
    attachments,
    uniqueId
  }: {
    participants: number[];
    content: string;
    rfqId: number;
    rfqQuoteProductId?: number;
    buyerId?: number;
    sellerId?: number;
    requestedPrice?: number;
    rfqQuotesUserId?: number | null;
    attachments?: any[],
    uniqueId: number
  }) => {
    if (socket) {
      socket.emit("createPrivateRoom", {
        creatorId: user?.id,
        participants,
        content,
        rfqId,
        rfqQuoteProductId,
        buyerId,
        sellerId,
        requestedPrice,
        rfqQuotesUserId,
        messageStatus: MessageStatus.READ,
        attachments,
        uniqueId
      });
    }
  };

  const updateRfqRequestStatus = ({
    roomId,
    id,
    status,
    rfqUserId,
    requestedPrice,
    rfqQuoteProductId
  }: {
    roomId: number | null;
    id: number;
    status: string;
    rfqUserId: number;
    requestedPrice: number;
    rfqQuoteProductId: number
  }) => {
    if (socket) {
      socket.emit("updateRfqPriceRequest", {
        roomId,
        id,
        status,
        userId: user?.id,
        rfqUserId,
        requestedPrice,
        rfqQuoteProductId
      });
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setNewRoom(null);
      setErrorMessage("");
      setNewMessage(null);
      setRfqRequest(null);
      setNewAttachment(null);
    }
  };

  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        newMessage,
        sendMessage,
        disconnectSocket,
        cratePrivateRoom,
        newRoom,
        errorMessage,
        clearErrorMessage,
        updateRfqRequestStatus,
        rfqRequest,
        newAttachment
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
