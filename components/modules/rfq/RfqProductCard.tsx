import { Button } from "@/components/ui/button";
// import { useCartStore } from "@/lib/rfqStore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import validator from "validator";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { FaCircleCheck } from "react-icons/fa6";
import ShoppingIcon from "@/components/icons/ShoppingIcon";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
// import Link from "next/link";

type RfqProductCardProps = {
  id: number;
  productType: "R" | "P";
  productName: string;
  productNote: string;
  productStatus: string;
  productImages: {
    image: string;
  }[];
  productQuantity: number;
  onAdd: (
    args0: number,
    args1: number,
    args2: "add" | "remove",
    args3?: number,
    args4?: number,
    args5?: string,
  ) => void;
  onToCart: () => void;
  onEdit: (args0: number) => void;
  onWishlist: () => void;
  isCreatedByMe: boolean;
  isAddedToCart: boolean;
  inWishlist?: boolean;
  haveAccessToken: boolean;
  productPrice: any;
  offerPriceFrom?: number;
  offerPriceTo?: number;
};

const RfqProductCard: React.FC<RfqProductCardProps> = ({
  id,
  productType,
  productName,
  productNote,
  productStatus,
  productImages,
  productQuantity,
  onAdd,
  onToCart,
  onEdit,
  onWishlist,
  isCreatedByMe,
  isAddedToCart,
  inWishlist,
  haveAccessToken,
  productPrice,
  offerPriceFrom,
  offerPriceTo,
}) => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    setQuantity(productQuantity || 0);
  }, [productQuantity]);

  return (
    <div className="product_list_part">
      {/* FIXME:  link disabled due to TYPE R product. error in find one due to no price */}
      {/* <Link href={`/trending/${id}`}> */}
      <div className="product_list_image relative">
        <Image
          alt="pro-5"
          className="p-3"
          src={
            productImages?.[0]?.image &&
            validator.isURL(productImages?.[0]?.image)
              ? productImages[0].image
              : PlaceholderImage
          }
          fill
        />
      </div>
      <div className="mb-3 flex flex-row items-center justify-center gap-x-3">
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 shadow-md"
          onClick={() =>
            onAdd(quantity + 1, id, "add", undefined, undefined, "")
          }
        >
          <ShoppingIcon />
        </Button>
        <Link
          href={`/trending/${id}`}
          className="relative flex h-8 w-8 items-center justify-center rounded-full !shadow-md"
        >
          <FiEye size={18} />
        </Link>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 shadow-md"
          onClick={onWishlist}
        >
          {inWishlist ? (
            <FaHeart color="red" size={16} />
          ) : (
            <FaRegHeart size={16} />
          )}
        </Button>
      </div>
      {/* </Link> */}
      <div className="product_list_content" dir={langDir}>
        <p>{productName}</p>
        {/* price For P type product */}
        {/* {productType === "P" ? (
          <>
            <label dir={langDir} translate="no">{t("price")}:</label>
            <p>{currency.symbol}{productPrice?.[0]?.offerPrice}</p>
          </>
        ) : null} */}
        {haveAccessToken ? (
          <div className="quantity_wrap mb-2">
            <label dir={langDir} translate="no">
              {t("quantity")}
            </label>
            <div className="qty-up-down-s1-with-rgMenuAction">
              <div className="flex items-center gap-x-3 md:gap-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="relative px-4 hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity - 1);
                    onAdd(
                      quantity - 1,
                      id,
                      "remove",
                      offerPriceFrom,
                      offerPriceTo,
                      "",
                    );
                  }}
                  disabled={quantity === 0}
                >
                  <Image
                    src="/images/upDownBtn-minus.svg"
                    alt="minus-icon"
                    fill
                    className="p-3"
                  />
                </Button>
                <p className="!mb-0 flex items-center !text-black">
                  {quantity}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="relative px-4 hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity + 1);
                    onAdd(
                      quantity + 1,
                      id,
                      "add",
                      offerPriceFrom,
                      offerPriceTo,
                      "",
                    );
                  }}
                >
                  <Image
                    src="/images/upDownBtn-plus.svg"
                    alt="plus-icon"
                    fill
                    className="p-3"
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onEdit(id)}
                  className="p-1"
                >
                  <div className="relative h-6 w-6">
                    <Image
                      src="/images/edit-rfq.png"
                      alt="edit-rfq-icon"
                      fill
                    />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {haveAccessToken ? (
          <div className="cart_button">
            {isAddedToCart ? (
              <button
                type="button"
                className="flex items-center justify-evenly gap-x-2 rounded-sm border border-[#E8E8E8] p-[10px] text-[15px] font-bold leading-5 text-[#7F818D]"
                disabled={quantity < 0}
                dir={langDir}
                translate="no"
              >
                <FaCircleCheck color="#00C48C" />
                {t("added_to_rfq_cart")}
              </button>
            ) : (
              <button
                type="button"
                className="add_to_cart_button"
                disabled={quantity > 0}
                onClick={() => {
                  onAdd(
                    quantity + 1,
                    id,
                    "add",
                    offerPriceFrom,
                    offerPriceTo,
                    "",
                  );
                }}
                dir={langDir}
                translate="no"
              >
                {t("add_to_rfq_cart")}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RfqProductCard;
