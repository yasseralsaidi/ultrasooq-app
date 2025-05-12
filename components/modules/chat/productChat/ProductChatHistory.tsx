import React, { useEffect, useRef } from "react";
import moment from "moment";
import { useAuth } from "@/context/AuthContext";
import { updateUnreadMessages } from "@/apis/requests/chat.requests";
import DownloadIconButton from "../DownloadIconButton";
import { useTranslations } from "next-intl";

interface ProductChatHistoryProps {
  roomId?: number | null;
  selectedChatHistory: any[];
  chatHistoryLoading?: boolean;
  buyerId?: number | undefined;
  unreadMsgCount?: number | 0;
  updateMessageCount?: () => void
}

const ProductChatHistory: React.FC<ProductChatHistoryProps> = ({
  roomId,
  selectedChatHistory,
  chatHistoryLoading,
  buyerId,
  unreadMsgCount,
  updateMessageCount
}) => {
  const t = useTranslations();
  const { user, langDir } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleUnreadMessages = async () => {
    try {
      if (user?.id && roomId && buyerId) {
        const payload = {
          userId: buyerId,
          roomId: roomId,
        };
        await updateUnreadMessages(payload);
        if (updateMessageCount) updateMessageCount()
      }
    } catch (error) { }
  };

  return (
    <div ref={chatContainerRef} className="h-[300px] w-full overflow-y-auto">
      <div className="d-flex w-full">
        {selectedChatHistory?.length > 0 ? (
          <div>
            {selectedChatHistory?.map((chat: any, index: number) => (
              <div key={index}>
                {chat?.userId === user?.id ? (
                  <div className="mt-5 flex w-full flex-wrap items-end">
                    <div className="w-[calc(100%-2rem)] pr-2 text-right">
                      <div className="mb-1 inline-block w-auto rounded-xl p-3 text-right text-sm">
                        {chat?.attachments?.length > 0 && (
                          <div className="mb-2 w-full">
                            {chat?.attachments.map((file: any, index: any) => (
                              <div
                                key={index}
                                className="border mb-2 border-gray-300 p-2 rounded-md flex justify-between items-center"
                              >
                                <div className="flex-1">
                                  {file?.fileType.includes("imag") && file?.presignedUrl ? (
                                    <img src={file?.presignedUrl} className="w-full max-w-sm h-auto" />
                                  ) : file?.fileType.includes("video") && file?.presignedUrl && (
                                    <video src={file?.presignedUrl} className="w-full max-w-sm h-auto" controls />
                                  )}
                                  <p className="mr-2 truncate">{file.fileName}</p>
                                  <p className="mr-2 truncate text-xs italic">
                                    {file?.status === "UPLOADING" ? "Uploading..." : file?.status}
                                  </p>
                                </div>
                                <DownloadIconButton
                                  attachmentId={file?.id}
                                  filePath={file?.filePath}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {chat?.content ? (
                          <div className="inline-block w-auto rounded-xl bg-[#0086FF] p-3 text-right text-sm text-white">
                            <p
                              dangerouslySetInnerHTML={{
                                __html: chat?.content,
                              }}
                            />
                          </div>
                        ) : null}

                      </div>

                      <div className="w-full text-right text-xs font-normal text-[#AEAFB8]">
                        {chat?.status === "SD" ?
                          <span>Sending...</span> :
                          <span>
                            {chat.createdAt
                              ? moment(chat.createdAt)
                                .startOf("seconds")
                                .fromNow()
                              : ""
                            }
                          </span>
                        }

                      </div>
                    </div>
                    <div className="h-[32px] w-[32px] rounded-full bg-[#F1F2F6]">
                      <span className="flex h-full w-full items-center justify-center">
                        {`${chat?.user?.firstName?.[0] ?? ""}${chat?.user?.lastName?.[0] ?? ""}`}
                      </span>
                      {/* <Image src={UserChatIcon} alt="user-chat-icon" /> */}
                    </div>
                  </div>
                ) : (chat?.attachments?.length > 0 || chat?.content) ? (
                  <div className="mt-5 flex w-full flex-wrap items-end">
                    <div className="h-[32px] w-[32px] rounded-full bg-[#F1F2F6]">
                      <span className="flex h-full w-full items-center justify-center">
                        {`${chat?.user?.firstName?.[0] ?? ""}${chat?.user?.lastName?.[0] ?? ""}`}
                      </span>
                    </div>
                    <div className="w-[calc(100%-2rem)] pl-2">
                      <div className="mb-1 inline-block w-auto rounded-xl p-3 text-left text-sm">

                        {chat?.attachments?.length > 0 ? (
                          <div className="mb-2 w-full">
                            {chat?.attachments.map((file: any, index: any) => (
                              <div
                                key={index}
                                className="border mb-2 border-gray-300 p-2 rounded-md flex justify-between items-center"
                              >
                                <div className="flex-1">
                                  {file?.fileType.includes("imag") && file?.presignedUrl ? (
                                    <img src={file?.presignedUrl} className="w-full max-w-sm h-auto" />
                                  ) : file?.fileType.includes("video") && file?.presignedUrl ? (
                                    <video src={file?.presignedUrl} className="w-full max-w-sm h-auto" controls />
                                  ) : null}
                                  <p className="mr-2 truncate">{file.fileName}</p>
                                  <p className="mr-2 truncate text-xs italic">
                                    {file?.status === "UPLOADING" ? "Uploading..." : file?.status}
                                  </p>
                                </div>
                                <DownloadIconButton
                                  attachmentId={file?.id}
                                  filePath={file?.filePath}
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {chat?.content ? (
                          <div className="inline-block w-auto rounded-xl bg-[#F1F2F6] p-3 text-right text-sm">
                            <p
                              dangerouslySetInnerHTML={{
                                __html: chat?.content,
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="w-full text-left text-xs font-normal text-[#AEAFB8]">
                        <span>
                          {chat.createdAt
                            ? moment(chat.createdAt)
                              .startOf("seconds")
                              .fromNow()
                            : ""
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex w-full flex-wrap items-end" dir={langDir} translate="no">
            {chatHistoryLoading ? "Loading..." : t("no_chat_history_found")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductChatHistory;
