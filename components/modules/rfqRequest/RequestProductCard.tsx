import React from "react";
import Image from "next/image";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { cn } from "@/lib/utils";
import validator from "validator";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type RequestProductCardProps = {
  rfqId?: number;
  onClick?: () => void;
  isSelected?: boolean;
  productImages?: {
    id: number;
    image: string;
  }[];
  messageInfo?: {
    lastUnreadMessage: {
      content: string;
      createdAt: string;
    };
    unreadMsgCount: number;
  };
};

const RequestProductCard: React.FC<RequestProductCardProps> = ({
  rfqId,
  onClick,
  isSelected,
  productImages,
  messageInfo,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-y-2 bg-white px-[10px] py-[15px] shadow-lg",
        isSelected ? "bg-[#F8F8F8]" : "",
      )}
      dir={langDir}
    >
      <div className="border-color-[#DBDBDB] h-auto w-full">
        <div className="flex flex-wrap gap-2 p-1">
          {productImages?.map((ele: any) => (
            <div
              key={ele?.id}
              className="relative h-14 w-14 border border-solid"
            >
              <Image
                src={
                  ele?.image && validator.isURL(ele.image)
                    ? ele.image
                    : PlaceholderImage
                }
                fill
                alt="preview"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-start text-sm font-normal text-[#1D77D1] lg:w-[calc(100%-4rem)] lg:flex-row">
        <span className="text-[#828593]" translate="no">{t("rfq_id")}: </span> RFQ000{rfqId}
      </div>

      {messageInfo?.lastUnreadMessage?.createdAt ? (
        <div>
          <div className="flex space-x-2 p-2">
            <div className="flex items-center space-x-1">
              <div className="text-xs font-normal text-gray-500">
                {messageInfo?.lastUnreadMessage.content}
              </div>
              {messageInfo?.unreadMsgCount ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                  {messageInfo?.unreadMsgCount}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          {messageInfo?.lastUnreadMessage?.createdAt ? (
            <div className="w-full text-right text-xs font-normal text-[#AEAFB8]">
              <span>
                {moment(messageInfo?.lastUnreadMessage?.createdAt)
                  .startOf("seconds")
                  .fromNow()}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </button>
  );
};

export default RequestProductCard;
