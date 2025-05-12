import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

type SellerCardProps = {
  productId: number;
  sellerName: string;
  offerPrice: string;
  productPrice: string;
  onAdd: () => void;
  onToCheckout: () => void;
  productProductPrice?: string;
  consumerDiscount?: number;
  consumerDiscountType?: string;
  vendorDiscount?: number;
  vendorDiscountType?: string;
  askForPrice?: string;
  askForStock?: string;
  deliveryAfter?: number;
  productLocation?: string;
  sellerId?: number;
  soldByTradeRole?: string;
  onChooseSeller?: () => void;
};

const SellerCard: React.FC<SellerCardProps> = ({
  productId,
  sellerName,
  offerPrice,
  productPrice,
  onAdd,
  onToCheckout,
  productProductPrice,
  consumerDiscount,
  consumerDiscountType,
  vendorDiscount,
  vendorDiscountType,
  askForPrice,
  askForStock,
  deliveryAfter,
  productLocation,
  sellerId,
  soldByTradeRole,
  onChooseSeller,
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const calculateDiscountedPrice = () => {
    const price = productProductPrice ? Number(productProductPrice) : 0;
    let discount = consumerDiscount || 0;
    let discountType = consumerDiscountType;
    if (user?.tradeRole && user.tradeRole != 'BUYER') {
      discount = vendorDiscount || 0;
      discountType = vendorDiscountType;
    }
    if (discountType != 'PERCENTAGE') {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-3 border-b border-solid border-gray-300">
        <div>
          <div className="h-[57px] w-full border-b border-solid border-gray-300 px-3 py-4">
            <span dir={langDir} translate="no">{t("seller")}</span>
          </div>
          <div className="w-full px-3 py-4">
            <Link
              href={
                soldByTradeRole === "COMPANY"
                  ? `/company-profile-details?userId=${sellerId}`
                  : soldByTradeRole === "FREELANCER"
                    ? `/freelancer-profile-details?userId=${sellerId}`
                    : "#"
              }
            >
              <h4 className="text-base font-medium text-dark-orange">
                {sellerName}
              </h4>
            </Link>
            <ul>
              <li className="relative my-2 pl-4 text-sm font-normal before:absolute before:left-0 before:top-[7px] before:h-[6px] before:w-[6px] before:rounded before:bg-slate-400 before:content-['']" dir={langDir} translate="no">
                {t("product_location")}: {productLocation || "N/A"}
              </li>
            </ul>
          </div>
        </div>
        {askForPrice !== "true" ? (
          <div>
            <div className="h-[57px] w-full border-b border-solid border-gray-300 px-3 py-4">
              <span dir={langDir} translate="no">{t("price")}</span>
            </div>
            <div className="w-full px-3 py-4">
              <div className="flex w-full items-end">
                <span className="text-md font-medium text-black">
                  {calculateDiscountedPrice
                    ? `${currency.symbol}${calculateDiscountedPrice()}`
                    : `${currency.symbol}${0}`}
                </span>
                <span className="ml-2 text-sm font-medium text-light-gray line-through">
                  {productProductPrice ? `${currency.symbol}${productProductPrice}` : `${currency.symbol}${0}`}
                </span>
              </div>
            </div>
          </div>
        ) : null}
        <div>
          <div className="h-[57px] w-full border-b border-solid border-gray-300 px-3 py-4">
            <span>Delivery</span>
          </div>
          <div className="w-full px-3 py-4">
            <div className="my-2 flex w-full text-sm font-medium">
              {deliveryAfter ? (
                <p dir={langDir} translate="no">{t("delivery_days_after").replace("{after}", String(deliveryAfter))}</p>
              ) : (
                <p dir={langDir} translate="no">{t("no_delivery_days")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-b border-solid border-gray-300 p-3">
        <div className="flex w-full items-center justify-between gap-2 text-sm font-medium">
          <button
            onClick={onChooseSeller}
            className="whitespace-nowrap rounded-sm bg-gray-500 px-6 py-3 text-sm font-bold capitalize text-white"
            dir={langDir}
            translate="no"
          >
            {t("choose_seller")}
          </button>

          {askForPrice !== "true" ? (
            <div className="flex w-full items-center justify-end gap-2 text-sm font-medium">
              <button
                onClick={onAdd}
                className="inline-block rounded-sm bg-dark-orange px-6 py-3 text-sm font-bold capitalize text-white"
                dir={langDir}
                translate="no"
              >
                {t("add_to_cart").toUpperCase()}
              </button>
              <button
                onClick={onToCheckout}
                className="inline-block rounded-sm bg-color-yellow px-6 py-3 text-sm font-bold capitalize text-white"
                dir={langDir}
                translate="no"
              >
                {t("buy_now").toUpperCase()}
              </button>
            </div>
          ) : (
            <button className="inline-block rounded-sm bg-color-yellow px-6 py-3 text-sm font-bold capitalize text-white" dir={langDir} translate="no">
              {t("message").toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
