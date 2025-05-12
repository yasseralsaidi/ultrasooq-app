import React, { useEffect, useRef } from "react";
import moment from "moment";
import { useAuth } from "@/context/AuthContext";
import { RfqProductPriceRequestStatus } from "@/utils/types/chat.types";
import { useSocket } from "@/context/SocketContext";
import { updateUnreadMessages } from "@/apis/requests/chat.requests";
import DownloadIconButton from "../DownloadIconButton";
import { useTranslations } from "next-intl";

interface SellerChatHistoryProps {
  roomId: number | null;
  selectedChatHistory: any[];
  chatHistoryLoading: boolean;
  updateRfqMessageCount: () => void;
  buyerId: number | undefined;
  rfqUserId: number;
  unreadMsgCount: number | 0;
  isUploadingCompleted?: boolean | null;
}

const SellerChatHistory: React.FC<SellerChatHistoryProps> = ({
  roomId,
  selectedChatHistory,
  chatHistoryLoading,
  updateRfqMessageCount,
  buyerId,
  unreadMsgCount,
  rfqUserId,
  isUploadingCompleted,
}) => {
  const t = useTranslations();
  const { user, currency, langDir } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { updateRfqRequestStatus } = useSocket();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [selectedChatHistory]);

  useEffect(() => {
    if (unreadMsgCount) handleUnreadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId, roomId]);

  const handlePriceStatus = async (
    chat: { id: number; requestedPrice: number; rfqQuoteProductId: number },
    status: RfqProductPriceRequestStatus,
  ) => {
    try {
      const payload = {
        id: chat.id,
        status,
        roomId: roomId,
        rfqUserId,
        requestedPrice: chat.requestedPrice,
        rfqQuoteProductId: chat.rfqQuoteProductId,
      };
      updateRfqRequestStatus(payload);
    } catch (error) {}
  };

  const handleUnreadMessages = async () => {
    try {
      if (user?.id && roomId && buyerId) {
        const payload = {
          userId: buyerId,
          roomId: roomId,
        };
        await updateUnreadMessages(payload);
        updateRfqMessageCount();
      }
    } catch (error) {}
  };

  return (
    <div ref={chatContainerRef} className="h-[300px] w-full overflow-y-auto">
      <div className="d-flex w-full">
        {selectedChatHistory.length > 0 ? (
          <div>
            {selectedChatHistory.map((chat: any, index: number) => (
              <div key={index}>
                {chat?.userId === user?.id ? (
                  <div className="mt-5 flex w-full flex-wrap items-end">
                    <div className="w-[calc(100%-2rem)] pr-2 text-right">
                      <div className="mb-1 inline-block w-auto rounded-xl p-3 text-right text-sm">
                        {chat?.attachments?.length > 0 ? (
                          <div className="mb-2 w-full">
                            {chat?.attachments.map((file: any, index: any) => (
                              <div
                                key={index}
                                className="mb-2 flex items-center justify-between rounded-md border border-gray-300 p-2"
                              >
                                <div className="flex-1">
                                  {file?.fileType.includes("imag") &&
                                  file?.presignedUrl ? (
                                    <img
                                      src={file?.presignedUrl}
                                      className="h-auto w-full max-w-sm"
                                    />
                                  ) : (
                                    file?.fileType.includes("video") &&
                                    file?.presignedUrl ? (
                                      <video
                                        src={file?.presignedUrl}
                                        className="h-auto w-full max-w-sm"
                                        controls
                                      />
                                    ) : null
                                  )}
                                  <p className="mr-2 truncate">
                                    {file.fileName}
                                  </p>
                                  {file?.status === "UPLOADING" ? (
                                    <p className="mr-2 truncate text-xs italic" translate="no">
                                      {t("uploading")}
                                    </p>
                                  ) : (
                                    <p className="mr-2 truncate text-xs italic">
                                      {file?.status}
                                    </p>
                                  )}
                                </div>
                                <DownloadIconButton
                                  attachmentId={file?.id}
                                  filePath={file?.filePath}
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <span translate="no">{isUploadingCompleted ? t("attachments_uploading") : ""}</span>
                        {chat?.content ? (
                          <div className="inline-block w-auto rounded-xl bg-[#0086FF] p-3 text-right text-sm text-white">
                            <p
                              dangerouslySetInnerHTML={{
                                __html: chat?.content,
                              }}
                            />

                            {chat?.rfqProductPriceRequest ? (
                              <div>
                                <p translate="no">
                                  {t("requested_price")}: {currency.symbol}
                                  {chat.rfqProductPriceRequest?.requestedPrice}
                                </p>
                                <p>
                                  status:
                                  {chat.rfqProductPriceRequest?.status ===
                                  "APPROVED" ? (
                                    <span className="rounded-sm bg-blue-700 p-0.5 text-white" translate="no">
                                      {t("approved")}
                                    </span>
                                  ) : chat.rfqProductPriceRequest?.status ===
                                    "REJECTED" ? (
                                    <span className="rounded-sm bg-red-600 p-0.5 text-white" translate="no">
                                      {t("rejected")}
                                    </span>
                                  ) : (
                                    <span className="rounded-sm bg-yellow-600 p-0.5 text-white" translate="no">
                                      {t("pending")}
                                    </span>
                                  )}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="w-full text-right text-xs font-normal text-[#AEAFB8]">
                        {chat?.status === "SD" ? (
                          <span translate="no">{t("sending")}</span>
                        ) : (
                          <span>
                            {chat.createdAt
                              ? moment(chat.createdAt)
                                  .startOf("seconds")
                                  .fromNow()
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-[32px] w-[32px] rounded-full bg-[#F1F2F6]">
                      <span className="flex h-full w-full items-center justify-center">
                        {`${chat?.user?.firstName?.[0] ?? ""}${chat?.user?.lastName?.[0] ?? ""}`}
                      </span>
                      {/* <Image src={UserChatIcon} alt="user-chat-icon" /> */}
                    </div>
                  </div>
                ) : (
                  (chat?.attachments?.length > 0 || chat?.content) ? (
                    <div className="mt-5 flex w-full flex-wrap items-end">
                      <div className="h-[32px] w-[32px] rounded-full bg-[#F1F2F6]">
                        <span className="flex h-full w-full items-center justify-center">
                          {`${chat?.user?.firstName?.[0] ?? ""}${chat?.user?.lastName?.[0] ?? ""}`}
                        </span>
                      </div>
                      <div className="w-[calc(100%-4rem)] pl-2">
                        <div className="mb-1 inline-block w-auto w-full rounded-xl p-3 text-left text-sm">
                          {chat?.attachments?.length > 0 ? (
                            <div className="mb-2 w-full">
                              {chat?.attachments.map(
                                (file: any, index: any) => (
                                  <div
                                    key={index}
                                    className="mb-2 flex items-center justify-between rounded-md border border-gray-300 p-2"
                                  >
                                    <div className="w-full flex-1">
                                      {file?.fileType.includes("imag") &&
                                      file?.presignedUrl ? (
                                        <img
                                          src={file?.presignedUrl}
                                          className="h-auto w-full max-w-sm"
                                        />
                                      ) : (
                                        file?.fileType.includes("video") &&
                                        file?.presignedUrl ? (
                                          <video
                                            src={file?.presignedUrl}
                                            className="h-auto w-full max-w-sm"
                                            controls
                                          />
                                        ) : null
                                      )}
                                      <p className="mr-2 truncate">
                                        {file.fileName}
                                      </p>
                                      {file?.status === "UPLOADING" ? (
                                        <p className="mr-2 truncate text-xs italic" translate="no">
                                          {t("uploading")}
                                        </p>
                                      ) : (
                                        <p className="mr-2 truncate text-xs italic">
                                          {file?.status}
                                        </p>
                                      )}
                                      <p className="mr-2 truncate text-xs italic">
                                        {file?.status === "UPLOADING"
                                          ? t("uploading")
                                          : file?.status}
                                      </p>
                                    </div>
                                    <DownloadIconButton
                                      attachmentId={file?.id}
                                      filePath={file?.filePath}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}
                          <span translate="no">{isUploadingCompleted ? t("attachments_uploading") : ""}</span>
                          {chat?.content ? (
                            <div className="inline-block w-auto rounded-xl bg-[#F1F2F6] p-3 text-right text-sm text-white">
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: chat?.content,
                                }}
                              />

                              {chat?.rfqProductPriceRequest ? (
                                <div>
                                  <p translate="no">
                                    {t("requested_price")}: {currency.symbol}
                                    {
                                      chat.rfqProductPriceRequest
                                        ?.requestedPrice
                                    }
                                  </p>
                                  <p>
                                    status:
                                    {chat.rfqProductPriceRequest?.status ===
                                    "APPROVED" ? (
                                      <span className="rounded-sm bg-blue-700 p-0.5 text-white" translate="no">
                                        {t("approved")}
                                      </span>
                                    ) : chat.rfqProductPriceRequest?.status ===
                                      "REJECTED" ? (
                                      <span className="rounded-sm bg-red-600 p-0.5 text-white" translate="no">
                                        {t("rejected")}
                                      </span>
                                    ) : (
                                      <span className="rounded-sm bg-yellow-700 p-0.5 text-white" translate="no">
                                        {t("pending")}
                                      </span>
                                    )}
                                  </p>
                                  {chat.rfqProductPriceRequest?.status ===
                                    "PENDING" ? (
                                    <div className="mt-2">
                                      <button
                                        onClick={() =>
                                          handlePriceStatus(
                                            chat.rfqProductPriceRequest,
                                            RfqProductPriceRequestStatus.APPROVED,
                                          )
                                        }
                                        type="button"
                                        className="me-2 rounded-lg bg-blue-700 px-2 py-2 text-white hover:bg-blue-800 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                        translate="no"
                                      >
                                        {t("accept")}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handlePriceStatus(
                                            chat.rfqProductPriceRequest,
                                            RfqProductPriceRequestStatus.REJECTED,
                                          )
                                        }
                                        type="button"
                                        className="me-2 rounded-lg bg-red-700 px-2 py-2 text-white hover:bg-red-800 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                        translate="no"
                                      >
                                        {t("reject")}
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <div className="w-full text-left text-xs font-normal text-[#AEAFB8]">
                          {chat?.status === "SD" ? (
                            <span translate="no">{t("sending")}</span>
                          ) : (
                            <span>
                              {chat.createdAt
                                ? moment(chat.createdAt)
                                    .startOf("seconds")
                                    .fromNow()
                                : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex w-full flex-wrap items-end" dir={langDir} translate="no">
            {chatHistoryLoading ? t("loading") : t("no_chat_history_found")}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatHistory;
