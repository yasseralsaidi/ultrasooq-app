import React, { useState, useEffect, useRef } from "react";
import { useGetProductDetails } from "@/apis/queries/chat.queries";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import AttachIcon from "@/public/images/attach.svg";
import { useToast } from "@/components/ui/use-toast";
import SmileIcon from "@/public/images/smile.svg";
import SendIcon from "@/public/images/send-button.png";
import ProductChatHistory from "./ProductChatHistory";
import { newAttachmentType, useSocket } from "@/context/SocketContext";
import {
  findRoomId,
  getChatHistory,
  uploadAttachment,
} from "@/apis/requests/chat.requests";
import { useAuth } from "@/context/AuthContext";
import AdminProductChat from "./Admin/AdminProductChat";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { generateUniqueNumber } from "@/utils/helper";
import { useTranslations } from "next-intl";

interface ProductChatProps {
  productId: number;
}

const ProductChat: React.FC<ProductChatProps> = ({ productId }) => {
  const t = useTranslations();
  const [message, setMessage] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [chatHistoryLoading, setChatHistoryLoading] = useState<boolean>(false);
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>([]);
  const [selectedChatHistory, setSelectedChatHistory] = useState<any>([]);
  const [isAttachmentUploading, setIsAttachmentUploading] =
    useState<boolean>(false);
  const inputRef = useRef(null);

  const {
    sendMessage,
    cratePrivateRoom,
    newMessage,
    errorMessage,
    clearErrorMessage,
    newAttachment,
  } = useSocket();
  const { toast } = useToast();
  const { user } = useAuth();

  const product = useGetProductDetails(productId);

  const productDetails = product?.data?.data;
  const sellerId =
    productDetails?.product_productPrice?.length > 0
      ? productDetails?.product_productPrice[0].adminDetail?.id
      : null;

  // check room id
  useEffect(() => {
    if (sellerId && user?.id !== sellerId) {
      checkRoomId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  useEffect(() => {
    if (selectedRoom && user?.id !== sellerId) {
      handleChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // receive a messaage
  useEffect(() => {
    if (newMessage) {
      handleNewMessage(newMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  // if any error exception
  useEffect(() => {
    if (errorMessage) {
      toast({
        title: t("chat"),
        description: errorMessage,
        variant: "danger",
      });
      clearErrorMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  // Update attachment status
  useEffect(() => {
    if (newAttachment) {
      handleUpdateAttachmentStatus(newAttachment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAttachment]);

  const handleUpdateAttachmentStatus = (attach: newAttachmentType) => {
    try {
      if (attach?.senderId === user?.id) {
        setSelectedChatHistory((prevChatHistory: any[]) =>
          prevChatHistory.map((item1: any) => ({
            ...item1,
            attachments: item1.attachments.map((item2: any) =>
              item2.uniqueId === attach.uniqueId
                ? {
                    ...item2,
                    status: attach.status,
                    filePath: attach.filePath,
                    presignedUrl: attach.presignedUrl,
                    fileType: attach?.fileType,
                  }
                : item2,
            ),
          })),
        );
      } else {
        const chatHistory = [...selectedChatHistory];
        const index = chatHistory.findIndex(
          (message: any) => message.id === attach.messageId,
        );
        if (index !== -1) {
          chatHistory[index]["attachments"].push(attach);
          setSelectedChatHistory(chatHistory);
        }
      }
    } catch (error) {
      toast({
        title: t("chat"),
        description: t("attachment_update_status_failed"),
        variant: "danger",
      });
    }
  };

  const checkRoomId = async () => {
    try {
      if (user?.id) {
        const payloadRoomFind = {
          userId: user?.id,
          rfqId: productDetails?.id,
        };
        const room = await findRoomId(payloadRoomFind);
        if (room?.data?.roomId) {
          setSelectedRoom(room?.data?.roomId);
        } else {
          setSelectedRoom(null);
          setChatHistoryLoading(false);
          setSelectedChatHistory([]);
        }
      }
    } catch (error) {
      setChatHistoryLoading(false);
    }
  };

  const handleChatHistory = async () => {
    try {
      setChatHistoryLoading(true);
      const payload = {
        roomId: selectedRoom,
      };
      const res = await getChatHistory(payload);
      if (res?.data?.status === 200) {
        setSelectedChatHistory(res.data.data);
      }
      setChatHistoryLoading(false);
    } catch (error) {
      setChatHistoryLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (message || attachments.length) {
        if (selectedRoom) {
          sendNewMessage(selectedRoom, message);
        } else {
          handleCreateRoom(message);
        }
        setMessage("");
        // setAttachments([]);
        setShowEmoji(false);
      } else {
        toast({
          title: t("chat"),
          description: t("please_type_your_message"),
          variant: "danger",
        });
      }
    } catch (error) {
      toast({
        title: t("chat"),
        description: t("failed"),
        variant: "danger",
      });
    }
  };

  const handleUploadedFile = async () => {
    if (attachments?.length) {
      setIsAttachmentUploading(true);
      const uploadPromises = attachments.map(async (file: any) => {
        const formData = new FormData();
        formData.append("content", file);
        formData.append("uniqueId", file.uniqueId);

        try {
          await uploadAttachment(formData);
        } catch (error) {
          console.error("File upload failed:", error);
        }
      });
      await Promise.all(uploadPromises);
      setAttachments([]);
      setIsAttachmentUploading(false);
    }
  };

  const sendNewMessage = (
    roomId: number,
    content: string,
    rfqQuoteProductId?: number,
    sellerUserId?: number,
    requestedPrice?: number,
  ) => {
    const uniqueId = generateUniqueNumber();
    const attach = attachments.map((att: any) => {
      const extension = att?.name.split(".").pop();
      return {
        fileType: att?.type,
        fileName: att?.name,
        fileSize: att?.size,
        filePath: "",
        fileExtension: extension,
        uniqueId: att.uniqueId,
        status: "UPLOADING",
      };
    });
    const newMessage = {
      roomId: "",
      rfqId: "",
      content: message,
      userId: user?.id,
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
      rfqQuotesUserId: null,
      attachments: attach,
      uniqueId,
      status: "SD",
      createdAt: new Date(),
    };
    const chatHistory = [...selectedChatHistory];
    chatHistory.push(newMessage);
    setSelectedChatHistory(chatHistory);

    const msgPayload = {
      roomId: roomId,
      content,
      rfqId: productDetails?.id,
      requestedPrice,
      rfqQuoteProductId,
      sellerId: sellerUserId,
      rfqQuotesUserId: null,
      attachments: attach,
      uniqueId: uniqueId,
    };
    sendMessage(msgPayload);
  };

  const handleNewMessage = (message: any) => {
    try {
      const chatHistory = [...selectedChatHistory];
      const index = chatHistory.findIndex(
        (chat) => chat?.uniqueId === message?.uniqueId,
      );
      if (index !== -1) {
        // upload attachment once the message saved in draft mode, if attachments are selected
        if (chatHistory[index]?.attachments?.length) handleUploadedFile();

        const nMessage = {
          ...message,
          attachments: chatHistory[index]?.attachments || [],
          status: "sent",
        };
        chatHistory[index] = nMessage;
      } else {
        const nMessage = {
          ...message,
          attachments: [],
        };
        chatHistory.push(nMessage);
      }
      setSelectedChatHistory(chatHistory);
      if (!selectedRoom) {
        setSelectedRoom(message?.roomId);
      }
    } catch (error) {}
  };

  const handleSendMessageKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = async (
    content: string,
    rfqQuoteProductId?: number,
    sellerUserId?: number,
    requestedPrice?: number,
  ) => {
    try {
      if (sellerId) {
        const uniqueId = generateUniqueNumber();
        const attach = attachments.map((att: any) => {
          const extension = att?.name.split(".").pop();
          return {
            fileType: att?.type,
            fileName: att?.name,
            fileSize: att?.size,
            filePath: "",
            uniqueId: att.uniqueId,
            fileExtension: extension,
            status: "UPLOADING",
          };
        });

        const newMessage = {
          roomId: "",
          rfqId: "",
          content: message,
          userId: user?.id,
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
          rfqQuotesUserId: null,
          attachments: attach,
          uniqueId,
          status: "SD",
          createdAt: new Date(),
        };
        const chatHistory = [...selectedChatHistory];
        chatHistory.push(newMessage);
        setSelectedChatHistory(chatHistory);

        const payload = {
          participants: [user?.id, sellerId],
          content,
          rfqId: productDetails?.id,
          requestedPrice,
          rfqQuoteProductId,
          sellerId: sellerUserId,
          rfqQuotesUserId: null,
          uniqueId,
          attachments: attach,
        };
        cratePrivateRoom(payload);
      }
    } catch (error) {
      return "";
    }
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleFileChange = (e: any) => {
    const files = Array.from(e.target.files);
    const newData = files.map((file: any) => {
      const uniqueId = generateUniqueNumber();
      file.uniqueId = `${user?.id}-${uniqueId}`;
      return file;
    });
    setAttachments(newData);
  };

  const removeFile = (index: number) => {
    setAttachments((prevFiles: any) =>
      prevFiles.filter((_: any, i: any) => i !== index),
    );
  };

  return (
    <div>
      <div className="flex w-full rounded-sm border border-solid border-gray-300">
        <div className="w-full border-r border-solid border-gray-300 lg:w-[15%]">
          <div className="flex h-[55px] min-w-full items-center border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]">
            <span translate="no">{t("product")}</span>
          </div>
          {productDetails ? (
            <a
              target="_blank"
              href={`/trending/${productDetails?.id}`}
              className="max-h-[720px] w-full overflow-y-auto p-2"
            >
              <div className="px-4">
                <div className="flex w-full">
                  <div className="text-xs font-normal text-gray-500">
                    <div className="flex w-full flex-wrap">
                      <div className="border-color-[#DBDBDB] relative h-[48px] w-[48px] border border-solid p-2">
                        {productDetails?.productImages?.map((img: any) => (
                          <Image
                            key={img?.id}
                            src={img?.image}
                            fill
                            alt="preview"
                          />
                        ))}
                      </div>
                      <div className="font-nromal flex w-[calc(100%-3rem)] items-center justify-start pl-3 text-xs text-black">
                        {productDetails?.productName}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 w-[calc(100%-4rem)] items-center justify-start text-sm font-normal text-[#1D77D1]">
                  <span className="text-[#828593]">
                    SKU NO: {productDetails?.skuNo}
                  </span>
                </div>
              </div>
            </a>
          ) : null}

          <div className="max-h-[720px] w-full overflow-y-auto p-2">
            {product?.isPending ? (
              <div className="my-2 space-y-2">
                {Array.from({ length: 1 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : null}

            {!product?.isPending && !productDetails ? (
              <div className="my-2 space-y-2">
                <p className="text-center text-sm font-normal text-gray-500" translate="no">
                  {t("no_data_found")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        {user?.id === sellerId ? (
          <AdminProductChat
            productId={productId}
            productDetails={productDetails}
            sellerId={sellerId}
          />
        ) : (
          <div className="w-full border-r border-solid border-gray-300 lg:w-[85%]">
            <div className="flex w-full flex-wrap p-[20px]">
              <div className="mb-5 max-h-[300px] w-full overflow-y-auto"></div>
              <ProductChatHistory
                selectedChatHistory={selectedChatHistory}
                chatHistoryLoading={chatHistoryLoading}
              />
            </div>
            {productDetails ? (
              <div className="mt-2 flex w-full flex-wrap border-t border-solid border-gray-300 px-[15px] py-[10px]">
                <div className="flex w-full items-center">
                  <div className="relative flex h-[32px] w-[32px] items-center">
                    <input
                      ref={inputRef}
                      type="file"
                      className="absolute inset-0 z-10 opacity-0"
                      multiple
                      onChange={handleFileChange}
                    />
                    <div className="absolute left-0 top-0 w-auto">
                      <Image src={AttachIcon} alt="attach-icon" />
                    </div>
                  </div>
                  <div className="flex w-[calc(100%-6.5rem)] items-center">
                    <textarea
                      placeholder="Type your message...."
                      className="h-[32px] w-full resize-none text-sm focus:outline-none"
                      onChange={(e) => setMessage(e.target.value)}
                      value={message}
                      onKeyDown={handleSendMessageKeyDown}
                    ></textarea>
                  </div>
                  <div className="flex w-[72px] items-center justify-between">
                    <div className="w-auto">
                      <Image
                        src={SmileIcon}
                        alt="smile-icon"
                        onClick={() => setShowEmoji(!showEmoji)}
                      />
                    </div>
                    <div className="flex w-auto">
                      <button type="button" className="">
                        <Image
                          src={SendIcon}
                          alt="send-icon"
                          onClick={handleSendMessage}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {showEmoji ? (
                  <div className="mt-2 w-full border-t border-solid">
                    <EmojiPicker onEmojiClick={onEmojiClick} className="mt-2" />
                  </div>
                ) : null}

                {!isAttachmentUploading && attachments.length > 0 ? (
                  <div className="mt-2 flex w-full flex-wrap gap-2">
                    {attachments.map((file: any, index: any) => (
                      <div
                        key={index}
                        className="flex items-center rounded-md border border-gray-300 p-2"
                      >
                        <span className="mr-2">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductChat;
