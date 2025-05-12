import React, { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { capitalizeWord, formatDate, formatPrice } from "@/utils/helper";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

type OfferPriceCardProps = {
  offerPrice: string;
  note: string;
  quantity: number;
  address: string;
  deliveryDate: string;
  productImage: string;
  productName: string;
  productId: number;
  onRequestPrice: (productId: number, requestedPrice: number) => void;
  priceRequest: any;
};

const OfferPriceCard: React.FC<OfferPriceCardProps> = ({
  offerPrice,
  note,
  quantity,
  address,
  deliveryDate,
  productImage,
  productName,
  productId,
  onRequestPrice,
  priceRequest,
}) => {
  const t = useTranslations();
  const { currency, langDir } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOfferPrice, setEditedOfferPrice] = useState("");

  useEffect(() => {
    setEditedOfferPrice(offerPrice);
  }, [offerPrice, priceRequest]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onRequestPrice(productId, parseInt(editedOfferPrice));
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedOfferPrice(offerPrice);
  };

  return (
    <div className="w-[600px] border-b border-solid border-gray-300 p-4 md:w-full">
      <div className="flex w-full">
        <div className="w-[25%] text-xs font-normal text-gray-500">
          <div className="flex w-full flex-wrap">
            <div className="border-color-[#DBDBDB] relative h-[48px] w-[48px] border border-solid p-2">
              <Image
                src={productImage || PlaceholderImage}
                alt="preview"
                fill
              />
            </div>
            <div className="font-nromal flex w-[calc(100%-3rem)] items-center justify-start pl-3 text-xs text-black">
              {productName || "-"}
            </div>
          </div>
        </div>
        <div className="w-[15%] px-1.5 py-2 text-xs font-normal text-black md:px-1.5 md:py-3">
          {formatDate(deliveryDate) || "-"}
        </div>
        <div className="w-[10%] px-1.5 py-2 text-xs font-normal text-black md:px-1.5 md:py-3">
          -
        </div>
        <div className="w-[15%] px-1.5 py-2 text-xs font-normal text-black md:px-1.5 md:py-3">
          {quantity}
        </div>
        <div className="w-[15%] px-1.5 py-2 text-xs font-normal text-black md:px-1.5 md:py-3">
          {isEditing ? (
            <div className="w-full">
              <input
                value={editedOfferPrice}
                onChange={(e) => setEditedOfferPrice(e.target.value)}
                className="w-full rounded border p-1"
                type="number"
              />
              <div className="mt-1 flex gap-1">
                <button
                  onClick={handleSaveClick}
                  className="text-blue-500"
                  translate="no"
                >
                  {t("save")}
                </button>
                <button
                  onClick={handleCancelClick}
                  className="text-red-500"
                  translate="no"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {editedOfferPrice ? `${currency.symbol}${editedOfferPrice}` : "-"}
              <button
                onClick={handleEditClick}
                className="ml-2 text-blue-500"
                translate="no"
              >
                {t("edit")}
              </button>
            </div>
          )}
        </div>
        <div className="w-[20%] px-1.5 py-2 text-xs font-normal text-black md:px-1.5 md:py-3">
          {address || "-"}
        </div>
      </div>
      {priceRequest?.status === "PENDING" ? (
        <div className="mt-3 flex w-full flex-wrap rounded-lg border border-solid border-gray-300 p-4">
          <p className="mb-2 text-sm font-normal text-gray-500">
            <span translate="no">{t("requested_offer_price")}:</span>
            <span className="mx-7">
              <span translate="no">{t("requested_price")}:</span>&nbsp;{" "}
              {formatPrice(priceRequest?.requestedPrice, currency.symbol)}
            </span>
            <span className="mr-7">
              <span translate="no">{t("status")}:</span>{" "}
              {capitalizeWord(priceRequest?.status)}
            </span>
            <span>
              <span translate="no">{t("date")}:</span>{" "}
              {moment(priceRequest?.updatedAt).format("YYYY-MM-DD HH:mm A")}
            </span>
          </p>
        </div>
      ) : null}
      <div
        className="mt-3 flex w-full flex-wrap rounded-lg border border-solid border-gray-300 p-4"
        dir={langDir}
      >
        <span className="mb-2 text-sm font-normal text-gray-500" translate="no">
          {t("vendor_note")}:
        </span>
        <p className="text-sm font-normal text-black"> {note || "-"}</p>
      </div>
    </div>
  );
};

export default OfferPriceCard;
