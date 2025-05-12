import { TrendingProduct } from "@/utils/types/common.types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import validator from "validator";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PlaceholderImage from "@/public/images/product-placeholder.png";
// import ShoppingIcon from "@/public/images/shopping-icon.svg";
// import EyeIcon from "@/public/images/eye-icon.svg";
// import CompareIcon from "@/public/images/compare-icon.svg";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import ShoppingIcon from "@/components/icons/ShoppingIcon";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { FaCircleCheck } from "react-icons/fa6";
import { toast } from "@/components/ui/use-toast";
import {
  useDeleteCartItem,
  useUpdateCartWithLogin,
  useUpdateCartWithService,
} from "@/apis/queries/cart.queries";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IoCloseSharp } from "react-icons/io5";
import { useClickOutside } from "use-events";

type ProductCardProps = {
  item: TrendingProduct;
  onWishlist: () => void;
  inWishlist?: boolean;
  haveAccessToken: boolean;
  isSeller?: boolean;
  productVariants?: any[];
  isAddedToCart?: boolean;
  cartQuantity?: number;
  productVariant: any;
  cartId?: number;
  relatedCart?: any
};

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onWishlist,
  inWishlist,
  haveAccessToken,
  isSeller,
  productVariants = [],
  isAddedToCart,
  cartQuantity = 0,
  productVariant,
  cartId,
  relatedCart
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();

  const [quantity, setQuantity] = useState<number>(cartQuantity);
  const [selectedProductVariant, setSelectedProductVariant] = useState<any>();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const handleConfirmDialog = () =>
    setIsConfirmDialogOpen(!isConfirmDialogOpen);
  const confirmDialogRef = useRef(null);
  const [isClickedOutsideConfirmDialog] = useClickOutside(
    [confirmDialogRef],
    (event) => {
      onCancelRemove();
    },
  );

  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartWithService = useUpdateCartWithService();
  const deleteCartItem = useDeleteCartItem();

  useEffect(() => {
    setQuantity(cartQuantity);
  }, [cartQuantity]);

  useEffect(() => {
    setSelectedProductVariant(productVariant);
  }, [productVariant]);

  const calculateDiscountedPrice = () => {
    const price = item.productProductPrice
      ? Number(item.productProductPrice)
      : 0;
    let discount = item.consumerDiscount || 0;
    let discountType = item.consumerDiscountType;
    if (user?.tradeRole && user?.tradeRole != "BUYER") {
      discount = item.vendorDiscount || 0;
      discountType = item.vendorDiscountType;
    }
    if (discountType == "PERCENTAGE") {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  const calculateAvgRating = useMemo(() => {
    const totalRating = item.productReview?.reduce(
      (acc: number, item: { rating: number }) => {
        return acc + item.rating;
      },
      0,
    );

    const result = totalRating / item.productReview?.length;
    return !isNaN(result) ? Math.floor(result) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.productReview?.length]);

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
    [item.productReview?.length],
  );

  const handleAddToCart = async (
    newQuantity: number,
    actionType: "add" | "remove",
    variant?: any,
  ) => {
    const minQuantity = item.productPrices?.length
      ? item.productPrices[0]?.minQuantityPerCustomer
      : null;
    const maxQuantity = item.productPrices?.length
      ? item.productPrices[0]?.maxQuantityPerCustomer
      : null;

    if (actionType == "add" && newQuantity == -1) {
      newQuantity =
        minQuantity && quantity < minQuantity ? minQuantity : quantity + 1;
    }

    if (actionType == "add" && minQuantity && minQuantity > newQuantity) {
      toast({
        description: t("min_quantity_must_be_n", { n: minQuantity }),
        variant: "danger",
      });
      return;
    }

    if (maxQuantity && maxQuantity < newQuantity) {
      toast({
        description: t("max_quantity_must_be_n", { n: maxQuantity }),
        variant: "danger",
      });
      return;
    }

    if (actionType == "remove" && minQuantity && minQuantity > newQuantity) {
      setIsConfirmDialogOpen(true);
      return;
    }

    if (!item?.productProductPriceId) {
      toast({
        title: t("something_went_wrong"),
        description: t("product_price_id_not_found"),
        variant: "danger",
      });
      return;
    }

    const response = await updateCartWithLogin.mutateAsync({
      productPriceId: item?.productProductPriceId,
      quantity: newQuantity,
      productVariant: variant || selectedProductVariant,
    });

    if (response.status) {
      if (actionType === "add" && newQuantity === 0) {
        setQuantity(1);
      } else {
        setQuantity(newQuantity);
      }
      toast({
        title:
          actionType == "add"
            ? t("item_added_to_cart")
            : t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
      return response.status;
    } else {
      toast({
        title: t("something_went_wrong"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  const handleQuantity = (
    quantity: number,
    action: "add" | "remove",
    variant?: any,
  ) => {
    const minQuantity = item.productPrices?.length
      ? item.productPrices[0]?.minQuantityPerCustomer
      : null;
    const maxQuantity = item.productPrices?.length
      ? item.productPrices[0]?.maxQuantityPerCustomer
      : null;

    if (maxQuantity && maxQuantity < quantity) {
      toast({
        description: t("max_quantity_must_be_n", { n: maxQuantity }),
        variant: "danger",
      });
      setQuantity(cartQuantity || maxQuantity);
      return;
    }

    setQuantity(quantity);
    if (cartId) {
      handleAddToCart(quantity, action);
    } else {
      if (minQuantity && minQuantity > quantity) {
        toast({
          description: t("min_quantity_must_be_n", { n: minQuantity }),
          variant: "danger",
        });
        return;
      }
    }
  };

  const handleQuantityChange = () => {
    if (quantity == 0 && cartQuantity != 0) {
      toast({
        description: t("quantity_can_not_be_0"),
        variant: "danger",
      });
      handleQuantity(quantity, "remove");
      return;
    }

    const minQuantity = item.productPrices?.length
      ? item.productPrices[0]?.minQuantityPerCustomer
      : null;
    if (minQuantity && minQuantity > quantity) {
      toast({
        description: t("min_quantity_must_be_n", { n: minQuantity }),
        variant: "danger",
      });
      handleQuantity(quantity, quantity > cartQuantity ? "add" : "remove");
      return;
    }

    const maxQuantity = item.productPrices?.length
      ? item.productPrices[0]?.maxQuantityPerCustomer
      : null;
    if (maxQuantity && maxQuantity < quantity) {
      toast({
        description: t("max_quantity_must_be_n", { n: maxQuantity }),
        variant: "danger",
      });
      setQuantity(cartQuantity || maxQuantity);
      return;
    }

    const action = quantity > cartQuantity ? "add" : "remove";
    if (quantity != cartQuantity) handleQuantity(quantity, action);
  };

  const handleRemoveItemFromCart = async (cartId: number) => {
    const response = await deleteCartItem.mutateAsync({ cartId });
    if (response.status) {
      toast({
        title: t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: t("item_not_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "danger",
      });
    }
  };

  const onConfirmRemove = () => {
    if (cartId) handleRemoveItemFromCart(cartId);
    setIsConfirmDialogOpen(false);
  };

  const onCancelRemove = () => {
    setQuantity(cartQuantity);
    setIsConfirmDialogOpen(false);
  };

  return (
    <div
      className={cn(
        item.status === "INACTIVE" ? "opacity-50" : "",
        "product-list-s1-col border-[1px] !border-transparent border-slate-300 p-3 hover:!border-slate-200 hover:bg-slate-100",
      )}
    >
      <div className="product-list-s1-box relative cursor-pointer ">
        <Link href={`/trending/${item.id}`}>
          {item?.askForPrice !== "true" ? (
            item.consumerDiscount ? (
              <div className="absolute right-2.5 top-2.5 z-10 inline-block rounded bg-dark-orange px-2 py-1.5 text-xs font-medium capitalize leading-5 text-white">
                <span>{item.consumerDiscount || 0}%</span>
              </div>
            ) : null
          ) : null}
          <div className="relative mx-auto mb-4 h-[110px] w-full md:h-36 md:w-36">
            <Image
              src={
                item?.productImage && validator.isURL(item.productImage)
                  ? item.productImage
                  : PlaceholderImage
              }
              alt="product-image"
              fill
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
              className="object-cover"
              blurDataURL="/images/product-placeholder.png"
              placeholder="blur"
            />
          </div>
        </Link>

        {haveAccessToken ? (
          <div className="mb-3 flex flex-row items-center justify-center gap-x-3">
            {item?.askForPrice !== "true" ? (
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0 shadow-md"
                onClick={() => handleAddToCart(-1, "add")}
                disabled={item.status === "INACTIVE"}
              >
                <ShoppingIcon />
              </Button>
            ) : null}

            <Link
              href={`/trending/${item.id}`}
              className="relative flex h-8 w-8 items-center justify-center rounded-full !shadow-md"
            >
              <FiEye size={18} />
            </Link>

            {!isSeller ? (
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0 shadow-md"
                onClick={onWishlist}
                disabled={item.status === "INACTIVE"}
              >
                {inWishlist ? (
                  <FaHeart color="red" size={16} />
                ) : (
                  <FaRegHeart size={16} />
                )}
              </Button>
            ) : null}

            {/* <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0 shadow-md"
              onClick={() => {
                console.log("shared");
              }}
            >
              <ShareIcon />
            </Button> */}
          </div>
        ) : null}

        <Link href={`/trending/${item.id}`}>
          <div className="relative w-full text-sm font-normal capitalize text-color-blue lg:text-base">
            <h4 className="mb-2.5 border-b border-solid border-gray-300 pb-2.5 text-xs font-normal uppercase text-color-dark">
              {item.productName}
            </h4>
            <p title={item.shortDescription} className="truncate">
              {item.shortDescription}
            </p>
            <div className="my-1 flex">
              {calculateRatings(calculateAvgRating)}
              <span className="ml-2">{item.productReview?.length}</span>
            </div>
          </div>
        </Link>
      </div>

      <div>
        {item?.askForPrice === "true" ? (
          <Link href={`/seller-rfq-request?product_id=${item?.id}`}>
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
          <Link href={`/trending/${item.id}`}>
            <h5 className="py-1 text-[#1D77D1]">
              {currency.symbol}
              {calculateDiscountedPrice()}{" "}
              <span className="text-gray-500 !line-through">
                {currency.symbol}
                {item.productProductPrice}
              </span>
            </h5>
          </Link>
        )}
      </div>

      {productVariants.length > 0 ? (
        <div className="mb-2">
          <label dir={langDir}>{productVariants[0].type}</label>
          <select
            className="w-full"
            value={selectedProductVariant?.value}
            onChange={(e) => {
              let value = e.target.value;
              const selectedVariant = productVariants.find(
                (variant: any) => variant.value == value,
              );
              setSelectedProductVariant(selectedVariant);
              if (isAddedToCart)
                handleAddToCart(quantity, "add", selectedVariant);
            }}
          >
            {productVariants.map((variant: any, index: number) => {
              return (
                <option key={index} value={variant.value} dir={langDir}>
                  {variant.value}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}

      <div className="quantity_wrap mb-2">
        <label dir={langDir} translate="no">
          {t("quantity")}
        </label>
        <div className="qty-up-down-s1-with-rgMenuAction">
          <div className="flex items-center gap-x-3 md:gap-x-4">
            <Button
              type="button"
              variant="outline"
              className="relative hover:shadow-sm"
              onClick={() => handleQuantity(quantity - 1, "remove")}
              disabled={
                quantity === 0 ||
                item.status === "INACTIVE" ||
                updateCartWithLogin?.isPending
              }
            >
              <Image
                src="/images/upDownBtn-minus.svg"
                alt="minus-icon"
                fill
                className="p-3"
              />
            </Button>
            <input
              type="text"
              value={quantity}
              className="h-auto w-[35px] border-none bg-transparent text-center focus:border-none focus:outline-none"
              onChange={(e) => {
                const value = Number(e.target.value);
                setQuantity(isNaN(value) ? cartQuantity : value);
              }}
              onBlur={handleQuantityChange}
            />
            <Button
              type="button"
              variant="outline"
              className="relative hover:shadow-sm"
              onClick={() => handleQuantity(quantity + 1, "add")}
              disabled={
                item.status === "INACTIVE" || updateCartWithLogin?.isPending
              }
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
      </div>

      <div className="cart_button">
        {isAddedToCart ? (
          <button
            type="button"
            className="flex items-center justify-evenly gap-x-2 rounded-sm border border-[#E8E8E8] p-[10px] text-[15px] font-bold leading-5 text-[#7F818D]"
            disabled={false}
            dir={langDir}
            translate="no"
          >
            <FaCircleCheck color="#00C48C" />
            {t("added_to_cart")}
          </button>
        ) : null}
        {!isAddedToCart ? (
          <button
            type="button"
            className="add_to_cart_button"
            onClick={() => handleAddToCart(quantity, "add")}
            disabled={
              quantity == 0 ||
              item.status === "INACTIVE" ||
              updateCartWithLogin?.isPending
            }
            dir={langDir}
            translate="no"
          >
            {t("add_to_cart")}
          </button>
        ) : null}
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={handleConfirmDialog}>
        <DialogContent
          className="add-new-address-modal add_member_modal gap-0 p-0 md:!max-w-2xl"
          ref={confirmDialogRef}
        >
          <div className="modal-header !justify-between" dir={langDir}>
            <DialogTitle className="text-center text-xl font-bold text-dark-orange"></DialogTitle>
            <Button
              onClick={onCancelRemove}
              className={`${langDir == "ltr" ? "absolute" : ""} right-2 top-2 z-10 !bg-white !text-black shadow-none`}
            >
              <IoCloseSharp size={20} />
            </Button>
          </div>

          <div className="mb-4 mt-4 text-center">
            <p className="text-dark-orange">
              Do you want to remove this item from cart?
            </p>
            <div>
              <Button
                type="button"
                className="mr-2 bg-white text-red-500"
                onClick={onCancelRemove}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-500"
                onClick={onConfirmRemove}
              >
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;
