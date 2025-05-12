import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MinusIcon from "@/public/images/upDownBtn-minus.svg";
import PlusIcon from "@/public/images/upDownBtn-plus.svg";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type ProductCardProps = {
  cartId: number;
  productId: number;
  productPriceId: number;
  productName: string;
  offerPrice: string;
  productQuantity: number;
  productVariant: any;
  productImages: { id: number; image: string }[];
  onAdd: (quantity: number, action: "add" | "remove", productPriceId: number, variant?: any) => void;
  onRemove: (args0: number) => void;
  onWishlist: (args0: number) => void;
  haveAccessToken: boolean;
  consumerDiscount: number;
  consumerDiscountType?: string;
  vendorDiscount: number;
  vendorDiscountType?: string;
  invalidProduct?: boolean;
  cannotBuy?: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  cartId,
  productId,
  productPriceId,
  productName,
  offerPrice,
  productQuantity,
  productVariant,
  productImages,
  onAdd,
  onRemove,
  onWishlist,
  haveAccessToken,
  consumerDiscount,
  consumerDiscountType,
  vendorDiscount,
  vendorDiscountType,
  invalidProduct,
  cannotBuy
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const calculateDiscountedPrice = () => {
    const price = offerPrice ? Number(offerPrice) : 0;
    let discount = consumerDiscount;
    let discountType = consumerDiscountType;
    if (user?.tradeRole && user?.tradeRole != 'BUYER') {
      discount = vendorDiscount;
      discountType = vendorDiscountType;
    }
    if (discountType == 'PERCENTAGE') {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  useEffect(() => {
    setQuantity(productQuantity);
  }, [productQuantity]);

  return (
    <>
      <div className="cart-item-list-col">
        <figure>
          <div className="image-container">
            <Image
              src={productImages?.[0]?.image || PlaceholderImage}
              alt="product-image"
              height={108}
              width={108}
            />
          </div>
          <figcaption>
            <h4 className="!text-lg !font-bold">{productName}</h4>
            <div className="custom-form-group">
              <label dir={langDir} translate="no">{t("quantity")}</label>
              <div className="qty-up-down-s1-with-rgMenuAction">
                <div className="flex items-center gap-x-4">
                  <Button
                    variant="outline"
                    className="relative hover:shadow-sm"
                    onClick={() => {
                      setQuantity(quantity - 1);
                      onAdd(quantity - 1, "remove", productPriceId, productVariant);
                    }}
                    disabled={quantity === 0}
                  >
                    <Image
                      src={MinusIcon}
                      alt="minus-icon"
                      fill
                      className="p-3"
                    />
                  </Button>
                  <p>{quantity}</p>
                  <Button
                    variant="outline"
                    className="relative hover:shadow-sm"
                    onClick={() => {
                      setQuantity(quantity + 1);
                      onAdd(quantity + 1, "add", productPriceId, productQuantity);
                    }}
                  >
                    <Image src={PlusIcon} alt="plus-icon" fill className="p-3" />
                  </Button>
                </div>
                <ul className="rgMenuAction-lists">
                  <li>
                    <Button
                      variant="ghost"
                      className="px-2 underline"
                      onClick={() => onRemove(cartId)}
                      dir={langDir}
                      translate="no"
                    >
                      {t("remove")}
                    </Button>
                  </li>
                  {haveAccessToken ? (
                    <li>
                      <Button
                        variant="ghost"
                        className="px-2 underline"
                        onClick={() => onWishlist(productId)}
                        dir={langDir}
                        translate="no"
                      >
                        {t("move_to_wishlist")}
                      </Button>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </figcaption>
        </figure>
        <div className="right-info">
          <h6 dir={langDir} translate="no">{t("price")}</h6>
          {invalidProduct || cannotBuy ? (
            <s>
              <h5 dir={langDir}>{currency.symbol}{quantity * calculateDiscountedPrice()}</h5>
            </s>
          ) : (
            <h5 dir={langDir}>{currency.symbol}{quantity * calculateDiscountedPrice()}</h5>
          )}
        </div>
      </div>
      <div>
        {invalidProduct ? <p className="text-[13px] text-red-500 p-2" translate="no">
          {t("you_cant_buy_this_product")}
        </p> : null}
        {cannotBuy ? <p className="text-[13px] text-red-500 p-2" translate="no">
          {t("product_not_available_for_your_location")}
        </p> : null}
      </div>
    </>
  );
};

export default ProductCard;
