import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import validator from "validator";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
// import { useCartStore } from "@/lib/rfqStore";

type RfqProductCardProps = {
  id: number;
  rfqProductId: number;
  productName: string;
  productQuantity: number;
  productImages: {
    image: string;
  }[];
  offerPriceFrom: string;
  offerPriceTo: string;
  onAdd: (
    args0: number,
    args1: number,
    args2: "add" | "remove",
    args3?: number,
    args4?: number,
    args5?: string,
  ) => void;
  onRemove: (args0: number) => void;
  note: string;
};

const RfqProductCard: React.FC<RfqProductCardProps> = ({
  id,
  rfqProductId,
  productName,
  productQuantity,
  productImages,
  offerPriceFrom,
  offerPriceTo,
  onAdd,
  onRemove,
  note,
}) => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const [quantity, setQuantity] = useState(1);
  // const cart = useCartStore();

  useEffect(() => {
    setQuantity(productQuantity);
  }, [productQuantity]);

  return (
    <div className="rfq-cart-item-li">
      <figure>
        <div className="image-container relative">
          <Image
            src={
              productImages?.[0]?.image &&
              validator.isURL(productImages?.[0]?.image)
                ? productImages[0].image
                : PlaceholderImage
            }
            alt="pro-6"
            fill
          />
        </div>
        <figcaption>
          <h5>{productName}</h5>
          <label dir={langDir} translate="no">{t("quantity")}</label>
          <div className="qty-with-remove">
            <div className="qty-up-down-s1-with-rgMenuAction">
              <div className="flex items-center gap-x-4">
                <Button
                  variant="outline"
                  className="relative hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity - 1);
                    onAdd(
                      quantity - 1,
                      rfqProductId,
                      "remove",
                      Number(offerPriceFrom || 0),
                      Number(offerPriceTo || 0),
                      note,
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
                <p className="!text-black">{quantity}</p>
                <Button
                  variant="outline"
                  className="relative hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity + 1);
                    onAdd(
                      quantity + 1,
                      rfqProductId,
                      "add",
                      Number(offerPriceFrom || 0),
                      Number(offerPriceTo || 0),
                      note,
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
              </div>
            </div>
            <Button
              variant="link"
              className="relative hover:shadow-sm"
              onClick={() => {
                onRemove(id);
              }}
              dir={langDir}
              translate="no"
            >
              {t("remove")}
            </Button>
          </div>
        </figcaption>
      </figure>
      <p dir={langDir}>
        <span translate="no">{t("note")}:</span> {note}
      </p>
      <div className="price-info" dir={langDir}>
        <h5 translate="no">{t("offer_price_from")}</h5>
        <p>{currency.symbol}{offerPriceFrom}</p>
      </div>
      <div className="price-info" dir={langDir}>
        <h5 translate="no">{t("offer_price_to")}</h5>
        <p>{currency.symbol}{offerPriceTo}</p>
      </div>
    </div>
  );
};

export default RfqProductCard;
