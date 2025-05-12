import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import validator from "validator";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import TrashIcon from "@/public/images/td-trash-icon.svg";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type WishlistCardProps = {
  productId: number;
  wishlistData: any;
  onDeleteFromWishlist: (wishListId: number) => void;
  id: number;
};

const WishlistCard: React.FC<WishlistCardProps> = ({
  productId,
  wishlistData,
  onDeleteFromWishlist,
  id,
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  
  const calculateDiscountedPrice = () => {
    const price = wishlistData?.product_productPrice?.[0]?.offerPrice
      ? Number(wishlistData.product_productPrice?.[0]?.offerPrice)
      : 0;
    let discount = wishlistData?.product_productPrice?.[0]?.consumerDiscount || 0;
    let discountType = wishlistData?.product_productPrice?.[0]?.consumerDiscountType;
    if (user?.tradeRole && user?.tradeRole != 'BUYER') {
      discount = wishlistData?.product_productPrice?.[0]?.vendorDiscount || 0;
      discountType = wishlistData?.product_productPrice?.[0]?.vendorDiscountType;
    }
    if (discountType == 'PERCENTAGE') {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  const calculateAvgRating = useMemo(() => {
    const totalRating = wishlistData?.productReview?.reduce(
      (acc: number, wishlistData: { rating: number }) => {
        return acc + wishlistData.rating;
      },
      0,
    );

    const result = totalRating / wishlistData?.productReview?.length;
    return !isNaN(result) ? Math.floor(result) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistData?.productReview?.length]);

  const calculateRatings = useMemo(
    () => (rating: number) => {
      const stars: Array<React.ReactNode> = [];
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          stars.push(<FaStar key={i} color="#FFC107" size={20} />);
        } else {
          stars.push(<FaRegStar key={i} color="#FFC107" size={20} />);
        }
      }
      return stars;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wishlistData?.productReview?.length],
  );

  return (
    <div className="product-list-s1-col relative">
      <div className="product-list-s1-box cursor-pointer hover:bg-slate-100">
        <Button
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white p-2"
          onClick={() => onDeleteFromWishlist(productId)}
        >
          <Image
            src={TrashIcon}
            height={26}
            width={26}
            alt="trash-icon"
            className=""
          />
        </Button>
        <Link href={`/trending/${wishlistData?.id}`}>
          <div className="relative mx-auto mb-4 h-36 w-36">
            <Image
              src={
                wishlistData?.productImages?.[0]?.image &&
                  validator.isURL(wishlistData.productImages[0].image)
                  ? wishlistData.productImages[0].image
                  : PlaceholderImage
              }
              alt="product-image"
              fill
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
              className="object-contain"
              blurDataURL="/images/product-placeholder.png"
              placeholder="blur"
            />
          </div>

          <div className="relative w-full text-sm font-normal capitalize text-color-blue lg:text-base">
            <h4 className="mb-2.5 border-b border-solid border-gray-300 pb-2.5 text-xs font-normal uppercase text-color-dark">
              {wishlistData?.productName}
            </h4>
            <p
              title={
                wishlistData?.product_productShortDescription?.length
                  ? wishlistData?.product_productShortDescription?.[0]
                    ?.shortDescription
                  : "-"
              }
              className="truncate"
            >
              {wishlistData?.product_productShortDescription?.length
                ? wishlistData?.product_productShortDescription?.[0]
                  ?.shortDescription
                : "-"}
            </p>
            <div className="my-1 flex">
              {calculateRatings(calculateAvgRating)}
              <span className="ml-2">
                {wishlistData?.productReview?.length}
              </span>
            </div>
          </div>
        </Link>
        <div>
          {wishlistData?.product_productPrice?.[0]?.askForPrice === "true" ? (
            <Link
              href={`/seller-rfq-request?product_id=${wishlistData?.product_productPrice?.[0]?.id}`}
            >
              <button
                type="button"
                className="inline-block w-full rounded-sm bg-color-yellow px-3 py-1 text-sm font-bold text-white"
                dir={langDir}
                translate="no"
              >
                {t("ask_vendor_for_price")}
              </button>
            </Link>
          ) : (
            <h5 className="py-1 text-[#1D77D1]">
              {currency.symbol}{calculateDiscountedPrice()}{" "}
              <span className="text-gray-500 !line-through">
                {currency.symbol}{wishlistData?.product_productPrice?.[0]?.offerPrice}
              </span>
            </h5>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
