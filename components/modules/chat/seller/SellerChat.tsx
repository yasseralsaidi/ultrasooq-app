import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import AttachIcon from "@/public/images/attach.svg";
import SmileIcon from "@/public/images/smile.svg";
import Link from "next/link";
import SendIcon from "@/public/images/send-button.png";
import OfferPriceCard from "@/components/modules/rfqRequest/OfferPriceCard";
import { useAllRfqQuotesUsersBySellerId } from "@/apis/queries/rfq.queries";
import { newAttachmentType, useSocket } from "@/context/SocketContext";
import {
  findRoomId,
  getChatHistory,
  updateUnreadMessages,
  uploadAttachment,
} from "@/apis/requests/chat.requests";
import RequestProductCard from "@/components/modules/rfqRequest/RequestProductCard";
import SellerChatHistory from "./SellerChatHistory";
import { useToast } from "@/components/ui/use-toast";
import { CHAT_REQUEST_MESSAGE } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { generateUniqueNumber } from "@/utils/helper";
import { useTranslations } from "next-intl";

interface RfqQuoteType {
  id: number;
  rfqQuotesId: number;
  offerPrice: string;
  buyerID: number;
  buyerIDDetail: {
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  rfqQuotesUser_rfqQuotes: {
    rfqQuotesProducts: {
      rfqProductDetails: {
        productImages: {
          id: number;
          image: string;
        }[];
      };
    }[];
    rfqQuotes_rfqQuoteAddress: {
      address: string;
      rfqDate: string;
    };
  };
  lastUnreadMessage: {
    content: string;
    createdAt: string;
  };
  unreadMsgCount: number;
}
interface SellerChatProps {}

const SellerChat: React.FC<SellerChatProps> = () => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const [activeSellerId, setActiveSellerId] = useState<number | undefined>();
  const [quoteProducts, setQuoteProducts] = useState<any[]>([]);
  const [rfqQuotes, setRfqQuotes] = useState<any[]>([]);
  const [selectedRfqQuote, setSelectedRfqQuote] = useState<any>("");
  const [chatHistoryLoading, setChatHistoryLoading] = useState<boolean>(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState<any>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>([]);
  const [isAttachmentUploading, setIsAttachmentUploading] =
    useState<boolean>(false);
  const {
    sendMessage,
    cratePrivateRoom,
    newMessage,
    newRoom,
    errorMessage,
    clearErrorMessage,
    rfqRequest,
    newAttachment,
  } = useSocket();
  const { toast } = useToast();
  const { user } = useAuth();

  const allRfqQuotesQuery = useAllRfqQuotesUsersBySellerId({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const rfqQuotesDetails = allRfqQuotesQuery.data?.data;

    if (rfqQuotesDetails?.length > 0) {
      setRfqQuotes(rfqQuotesDetails);
      setActiveSellerId(rfqQuotesDetails[0]?.id);
      setSelectedRfqQuote(rfqQuotesDetails[0]);
      handleRfqProducts(rfqQuotesDetails[0]);
    }
  }, [allRfqQuotesQuery.data?.data]);

  // check room id
  useEffect(() => {
    if (selectedRfqQuote?.sellerID && selectedRfqQuote?.buyerID) {
      checkRoomId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRfqQuote]);

  // get chat history
  useEffect(() => {
    if (selectedRoom) {
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

  // update the new message status
  useEffect(() => {
    if (newMessage?.rfqId === selectedRfqQuote?.rfqQuotesId) {
      handleUpdateNewMessageStatus(newMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  // if new room crated
  useEffect(() => {
    if (newRoom?.roomId) {
      setSelectedRoom(newRoom?.roomId);
    }
  }, [newRoom]);

  // if rfqRequest
  useEffect(() => {
    if (rfqRequest) {
      handleRfqRequest(rfqRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqRequest]);

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
            attachments: item1?.attachments?.map((item2: any) =>
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

  const handleUpdateNewMessageStatus = async (message: any) => {
    try {
      if (
        selectedRfqQuote?.rfqQuotesId === message?.rfqId &&
        message?.userId !== user?.id
      ) {
        if (selectedRfqQuote?.buyerID && selectedRoom) {
          const payload = {
            userId: selectedRfqQuote?.buyerID,
            roomId: selectedRoom,
          };
          await updateUnreadMessages(payload);
        }
      }
    } catch (error) {}
  };

  const handleNewMessage = (message: any) => {
    try {
      const index = rfqQuotes.findIndex(
        (rfq: any) => message?.rfqId === rfq.rfqQuotesId,
      );
      if (index !== -1) {
        const rfqList = [...rfqQuotes];
        const [item] = rfqList.splice(index, 1);
        let newItem = {
          ...item,
          lastUnreadMessage: {
            content: message.content,
            createdAt: message.createdAt,
          },
        };

        if (selectedRfqQuote?.rfqQuotesId !== message?.rfqId) {
          newItem = {
            ...newItem,
            unreadMsgCount: newItem?.unreadMsgCount + 1,
          };
        }
        rfqList.unshift(newItem);
        setRfqQuotes(rfqList);
        if (selectedRfqQuote?.rfqQuotesId === message.rfqId) {
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
              status: "sent",
            };
            chatHistory.push(nMessage);
          }
          setSelectedChatHistory(chatHistory);
        }

        if (message?.rfqProductPriceRequest) {
          updateRFQProduct(message?.rfqProductPriceRequest);
        }
      }
    } catch (error) {}
  };

  const handleSendMessage = async () => {
    try {
      if (message || attachments.length) {
        if (selectedRoom) {
          sendNewMessage(selectedRoom, message);
        } else if (
          !selectedRoom &&
          selectedRfqQuote?.sellerID &&
          selectedRfqQuote?.buyerID
        ) {
          handleCreateRoom(message);
        }
        setMessage("");
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

  const sendNewMessage = (
    roomId: number,
    content: string,
    rfqQuoteProductId?: number,
    sellerId?: number,
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
      rfqId: selectedRfqQuote?.rfqQuotesId,
      requestedPrice,
      rfqQuoteProductId,
      sellerId,
      rfqQuotesUserId: activeSellerId,
      uniqueId,
      attachments: attach,
    };
    sendMessage(msgPayload);
  };

  const handleCreateRoom = async (
    content: string,
    rfqQuoteProductId?: number,
    sellerId?: number,
    requestedPrice?: number,
  ) => {
    try {
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
        participants: [selectedRfqQuote?.sellerID, selectedRfqQuote?.buyerID],
        content,
        rfqId: selectedRfqQuote?.rfqQuotesId,
        requestedPrice,
        rfqQuoteProductId,
        sellerId,
        rfqQuotesUserId: activeSellerId,
        uniqueId,
        attachments: attach,
      };
      cratePrivateRoom(payload);
    } catch (error) {
      return "";
    }
  };

  const checkRoomId = async () => {
    try {
      const payloadRoomFind = {
        rfqId: selectedRfqQuote?.rfqQuotesId,
        userId: selectedRfqQuote?.sellerID,
      };
      const room = await findRoomId(payloadRoomFind);
      if (room?.data?.roomId) {
        setSelectedRoom(room?.data?.roomId);
      } else {
        setSelectedRoom(null);
        setChatHistoryLoading(false);
        setSelectedChatHistory([]);
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

  const handleSendMessageKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRequestPrice = (productId: number, requestedPrice: number) => {
    if (selectedRoom && requestedPrice) {
      sendNewMessage(
        selectedRoom,
        CHAT_REQUEST_MESSAGE.priceRequest.value,
        productId,
        selectedRfqQuote?.sellerID,
        requestedPrice,
      );
    } else if (
      !selectedRoom &&
      requestedPrice &&
      selectedRfqQuote?.sellerID &&
      selectedRfqQuote?.buyerID
    ) {
      handleCreateRoom(
        CHAT_REQUEST_MESSAGE.priceRequest.value,
        productId,
        selectedRfqQuote?.sellerID,
        requestedPrice,
      );
    }
  };

  const handleRfqRequest = (rRequest: {
    id: number;
    messageId: number;
    requestedPrice: number;
    rfqQuoteProductId: number;
    requestedById: number;
    status: string;
    newTotalOfferPrice: number;
  }) => {
    const chatHistory = [...selectedChatHistory];
    const index = chatHistory.findIndex(
      (chat) => chat.id === rRequest.messageId,
    );
    if (index !== -1) {
      const currentMsg = chatHistory[index];
      const updatedMessage = {
        ...currentMsg,
        rfqProductPriceRequest: {
          ...currentMsg.rfqProductPriceRequest,
          status: rRequest.status,
        },
      };
      chatHistory[index] = updatedMessage;
      setSelectedChatHistory(chatHistory);
    }

    // UPDATE TOTAL PRICE
    if (rRequest.status === "APPROVED") {
      setSelectedRfqQuote((prevSelectedRfqQuote: any) => ({
        ...prevSelectedRfqQuote,
        offerPrice: rRequest.newTotalOfferPrice,
      }));
    }

    // UPDATE RFQ PRODUCT
    updateRFQProduct(rRequest);
  };

  const updateRFQProduct = (rRequest: {
    id: number;
    messageId: number;
    requestedPrice: number;
    rfqQuoteProductId: number;
    requestedById: number;
    status: string;
    newTotalOfferPrice: number;
  }) => {
    if (
      selectedRfqQuote?.buyerID === rRequest?.requestedById ||
      (rRequest?.requestedById === user?.id && rRequest?.status === "REJECTED")
    ) {
      const index = quoteProducts.findIndex(
        (product: any) => product.id === rRequest.rfqQuoteProductId,
      );
      if (index !== -1) {
        const pList = [...quoteProducts];
        const product = { ...pList[index] };
        let offerPrice = product.offerPrice;
        if (rRequest.status === "APPROVED") {
          offerPrice = rRequest?.requestedPrice;
        }

        let priceRequest = product?.priceRequest
          ? { ...product.priceRequest }
          : null;

        if (priceRequest) {
          priceRequest = {
            ...priceRequest,
            id: rRequest.id,
            requestedPrice: rRequest.requestedPrice,
            rfqQuoteProductId: rRequest.rfqQuoteProductId,
            status: rRequest?.status,
          };
        } else {
          priceRequest = {
            ...rRequest,
          };
        }

        product.priceRequest = priceRequest;
        product.offerPrice = offerPrice;
        pList[index] = product;
        setQuoteProducts(pList);
      }
    }
  };

  const handleRfqProducts = (item: any) => {
    const newData =
      item?.rfqQuotesUser_rfqQuotes?.rfqQuotesProducts.map((i: any) => {
        let priceRequest = null;
        const pRequest = item?.rfqProductPriceRequests?.find(
          (request: any) =>
            request?.rfqQuoteProductId === i.id &&
            request?.status === "APPROVED",
        );
        if (pRequest) priceRequest = pRequest;
        let offerPrice = i.offerPrice;
        if (
          pRequest &&
          pRequest.status &&
          typeof pRequest.status == "string" &&
          pRequest?.status === "APPROVED"
        ) {
          offerPrice = pRequest?.requestedPrice;
        }
        return {
          ...i,
          priceRequest,
          offerPrice,
          address:
            item?.rfqQuotesUser_rfqQuotes?.rfqQuotes_rfqQuoteAddress?.address,
          deliveryDate:
            item?.rfqQuotesUser_rfqQuotes?.rfqQuotes_rfqQuoteAddress?.rfqDate,
        };
      }) || [];
    setQuoteProducts(newData);
  };

  const updateRfqMessageCount = () => {
    const index = rfqQuotes.findIndex(
      (rfq: RfqQuoteType) => rfq.rfqQuotesId === selectedRfqQuote?.rfqQuotesId,
    );
    if (index !== -1) {
      const rfqList = [...rfqQuotes];
      rfqList[index]["unreadMsgCount"] = 0;
      setRfqQuotes(rfqList);
    }
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
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
      <div className="flex w-full flex-wrap rounded-sm border border-solid border-gray-300">
        <div className="w-full border-r border-solid border-gray-300 md:w-[20%]">
          <div
            className="flex h-[55px] min-w-full items-center border-b border-solid border-gray-300 px-[5px] py-[5px] text-sm font-normal text-[#333333] md:px-[10px] md:py-[10px] md:text-base"
            dir={langDir}
          >
            <span translate="no">{t("request_for_rfq")}</span>
          </div>
          <div className="max-h-[720px] w-full overflow-y-auto p-2">
            {allRfqQuotesQuery?.isLoading ? (
              <div className="my-2 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : null}

            {!allRfqQuotesQuery?.isLoading && !rfqQuotes?.length ? (
              <div className="my-2 space-y-2">
                <p
                  className="text-center text-sm font-normal text-gray-500"
                  dir={langDir}
                  translate="no"
                >
                  {t("no_data_found")}
                </p>
              </div>
            ) : null}

            {rfqQuotes?.map((item: RfqQuoteType) => (
              <RequestProductCard
                key={item?.id}
                rfqId={item?.rfqQuotesId}
                // name={`${item?.buyerIDDetail?.firstName} ${item?.buyerIDDetail?.lastName}`}
                // profilePicture={item?.buyerIDDetail?.profilePicture}
                // offerPrice={item?.offerPrice}
                onClick={() => {
                  setSelectedRfqQuote(item);
                  setActiveSellerId(item?.id);
                  handleRfqProducts(item);
                }}
                isSelected={activeSellerId === item?.id}
                productImages={item?.rfqQuotesUser_rfqQuotes?.rfqQuotesProducts
                  ?.map((item: any) => item?.rfqProductDetails?.productImages)
                  ?.map((item: any) => item?.[0])}
                messageInfo={{
                  lastUnreadMessage: item?.lastUnreadMessage,
                  unreadMsgCount: item?.unreadMsgCount,
                }}
              />
            ))}
          </div>
        </div>
        <div className="w-full border-r border-solid border-gray-300 md:w-[80%]">
          <div
            className="flex min-h-[55px] w-full items-center justify-between border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]"
            dir={langDir}
          >
            <span>
              {t("offering_price")}{" "}
              <b className="text-[#679A03]">
                {selectedRfqQuote?.offerPrice
                  ? `${currency.symbol}${selectedRfqQuote?.offerPrice}`
                  : "-"}
              </b>
            </span>
            <Link
              href="#"
              className="inline-block rounded-sm bg-dark-orange px-3 py-2 text-xs font-bold capitalize text-white"
              translate="no"
            >
              {t("checkout")}
            </Link>
          </div>
          <div className="flex w-full flex-wrap p-[20px]">
            <div className="mb-5 max-h-max w-full border border-solid border-gray-300 md:max-h-[300px]">
              <div className="w-full overflow-y-auto rounded-sm">
                <div className="flex w-[600px] md:w-full">
                  <div
                    className="w-[25%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("product")}
                  </div>
                  <div
                    className="w-[15%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("delivery_date")}
                  </div>
                  <div
                    className="w-[10%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("brand")}
                  </div>
                  <div
                    className="w-[15%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("number_of_piece")}
                  </div>
                  <div
                    className="w-[15%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("price")}
                  </div>
                  <div
                    className="w-[20%] border-b border-solid border-gray-300 px-1.5 py-3 text-xs font-normal text-gray-500 md:text-sm"
                    dir={langDir}
                    translate="no"
                  >
                    {t("address")}
                  </div>
                </div>
                {allRfqQuotesQuery.isLoading ? (
                  <div className="m-2 space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : null}

                {!allRfqQuotesQuery?.isLoading && !quoteProducts?.length ? (
                  <div className="my-2 space-y-2 py-10">
                    <p
                      className="text-center text-sm font-normal text-gray-500"
                      dir={langDir}
                      translate="no"
                    >
                      {t("no_data_found")}
                    </p>
                  </div>
                ) : null}

                {quoteProducts?.map(
                  (item: {
                    id: number;
                    offerPrice: string;
                    priceRequest: any;
                    note: string;
                    quantity: number;
                    rfqProductDetails: {
                      productName: string;
                      productImages: {
                        id: number;
                        image: string;
                      }[];
                    };
                    address: string;
                    deliveryDate: string;
                  }) => (
                    <OfferPriceCard
                      key={item?.id}
                      productId={item?.id}
                      offerPrice={item?.offerPrice}
                      note={item?.note}
                      quantity={item?.quantity}
                      address={item?.address}
                      deliveryDate={item?.deliveryDate}
                      productImage={
                        item?.rfqProductDetails?.productImages[0]?.image
                      }
                      productName={item?.rfqProductDetails?.productName}
                      onRequestPrice={handleRequestPrice}
                      priceRequest={item?.priceRequest}
                    />
                  ),
                )}
              </div>
            </div>
            {rfqQuotes?.length > 0 ? (
              <SellerChatHistory
                roomId={selectedRoom}
                selectedChatHistory={selectedChatHistory}
                chatHistoryLoading={chatHistoryLoading}
                buyerId={selectedRfqQuote?.buyerID}
                rfqUserId={selectedRfqQuote?.id}
                updateRfqMessageCount={updateRfqMessageCount}
                unreadMsgCount={selectedRfqQuote?.unreadMsgCount}
              />
            ) : (
              ""
            )}
          </div>
          {rfqQuotes?.length > 0 ? (
            <div className="mt-2 flex w-full flex-wrap border-t border-solid border-gray-300 px-[15px] py-[10px]">
              <div className="flex w-full items-center">
                <div className="relative flex h-[32px] w-[32px] items-center">
                  <input
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
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    placeholder="Type your message...."
                    className="h-[32px] w-full resize-none text-sm focus:outline-none"
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
                    <button
                      onClick={handleSendMessage}
                      type="button"
                      className=""
                    >
                      <Image src={SendIcon} alt="send-icon" />
                    </button>
                  </div>
                </div>
              </div>
              {showEmoji ? (
                <div className="mt-2 w-full border-t border-solid">
                  <EmojiPicker
                    lazyLoadEmojis={true}
                    onEmojiClick={onEmojiClick}
                    className="mt-2"
                  />
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
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerChat;
