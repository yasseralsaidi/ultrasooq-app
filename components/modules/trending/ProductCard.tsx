import { TrendingProduct } from "@/utils/types/common.types";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useEffect, useState, useRef } from "react";
import validator from "validator";
import { Checkbox } from "@/components/ui/checkbox";
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { FaCircleCheck } from "react-icons/fa6";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { Button } from "@/components/ui/button";
import ShoppingIcon from "@/components/icons/ShoppingIcon";
import { useCartStore } from "@/lib/rfqStore";
import { toast } from "@/components/ui/use-toast";
import {
  useDeleteCartItem,
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
  useUpdateCartWithService,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { useTranslations, useLocale } from "next-intl"; // Import useLocale
import { useAuth } from "@/context/AuthContext";
import { useClickOutside } from "use-events";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IoCloseSharp } from "react-icons/io5";

type ProductCardProps = {
  item: TrendingProduct;
  productVariants?: any[];
  onWishlist: () => void;
  inWishlist?: boolean;
  haveAccessToken: boolean;
  isInteractive?: boolean;
  isSelectable?: boolean;
  selectedIds?: number[];
  onSelectedId?: (args0: boolean | string, args1: number) => void;
  productQuantity?: number;
  productVariant?: any;
  cartId?: number;
  isAddedToCart?: boolean;
  serviceId?: number;
  serviceCartId?: number;
  relatedCart?: any;
  sold?: number;
};

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  productVariants = [],
  onWishlist,
  inWishlist,
  haveAccessToken,
  isInteractive,
  isSelectable,
  selectedIds,
  onSelectedId,
  productQuantity = 0,
  productVariant,
  cartId,
  serviceId,
  serviceCartId,
  relatedCart,
  isAddedToCart,
  sold,
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const language = useLocale(); // Get the current locale (e.g., "en" or "ar")

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const deviceId = getOrCreateDeviceId() || "";

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
      (acc: number, item: { rating: number }) => acc + item.rating,
      0,
    );
    const result = totalRating / item.productReview?.length;
    return !isNaN(result) ? Math.floor(result) : 0;
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
    [item.productReview?.length],
  );

  const [quantity, setQuantity] = useState(0);
  const [selectedProductVariant, setSelectedProductVariant] = useState<any>();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const handleConfirmDialog = () =>
    setIsConfirmDialogOpen(!isConfirmDialogOpen);
  const confirmDialogRef = useRef(null);
  const [isClickedOutsideConfirmDialog] = useClickOutside(
    [confirmDialogRef],
    () => onCancelRemove(),
  );

  useEffect(() => {
    setQuantity(productQuantity || 0);
  }, [productQuantity]);

  useEffect(() => {
    setSelectedProductVariant(productVariant || productVariants?.[0]);
  }, [productVariants, productVariant]);

  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartByDevice = useUpdateCartByDevice();
  const updateCartWithService = useUpdateCartWithService();
  const deleteCartItem = useDeleteCartItem();

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

    if (haveAccessToken) {
      if (!item?.productProductPriceId) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }

      let linkService = !!(!cartId && serviceId && serviceCartId);
      console.log(linkService, cartId, serviceId, relatedCart);

      if (linkService) {
        const response = await updateCartWithService.mutateAsync({
          productId: item?.id,
          productPriceId: item?.productProductPriceId,
          quantity: newQuantity,
          productVariant: variant || selectedProductVariant,
          serviceId: relatedCart?.serviceId || serviceId,
          cartId: relatedCart?.id || serviceCartId
        });
  
        if (response.success) {
          setQuantity(
            actionType === "add" && newQuantity === 0 ? 1 : newQuantity,
          );
          toast({
            title:
              actionType == "add"
                ? t("item_added_to_cart")
                : t("item_removed_from_cart"),
            description: t("check_your_cart_for_more_details"),
            variant: "success",
          });
          return response.success;
        } else {
          toast({
            title: t("something_went_wrong"),
            description: response.message,
            variant: "danger",
          });
        }

        return;
      }

      const response = await updateCartWithLogin.mutateAsync({
        productPriceId: item?.productProductPriceId,
        quantity: newQuantity,
        productVariant: variant || selectedProductVariant,
      });

      if (response.status) {
        setQuantity(
          actionType === "add" && newQuantity === 0 ? 1 : newQuantity,
        );
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

    } else {
      if (!item?.productProductPriceId) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }
      const response = await updateCartByDevice.mutateAsync({
        productPriceId: item?.productProductPriceId,
        quantity: newQuantity,
        deviceId,
        productVariant: variant || selectedProductVariant,
      });
      if (response.status) {
        setQuantity(
          actionType === "add" && newQuantity === 0 ? 1 : newQuantity,
        );
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
    }
  };

  const handleQuantity = (quantity: number, action: "add" | "remove") => {
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
      setQuantity(productQuantity || maxQuantity);
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
    if (quantity == 0 && productQuantity != 0) {
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
      handleQuantity(quantity, quantity > productQuantity ? "add" : "remove");
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
      setQuantity(productQuantity || maxQuantity);
      return;
    }

    const action = quantity > productQuantity ? "add" : "remove";
    if (quantity != productQuantity) handleQuantity(quantity, action);
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
    setQuantity(productQuantity);
    setIsConfirmDialogOpen(false);
  };

  const getLocalTimestamp = (dateStr: any, timeStr: any) => {
    const date = new Date(dateStr);
    const [hours, minutes] = (timeStr || "").split(":").map(Number);
    date.setHours(hours, minutes || 0, 0, 0);
    return date.getTime();
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const isArabic = language === "ar";
    const numberFormatter = new Intl.NumberFormat(language, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    const formattedDays = days.toString();
    const formattedHours = numberFormatter.format(hours);
    const formattedMinutes = numberFormatter.format(minutes);
    const formattedSeconds = numberFormatter.format(seconds);

    const daysLabel = t("days");

    const timeString = isArabic
      ? `${formattedSeconds}:${formattedMinutes}:${formattedHours} ؛${daysLabel} ${formattedDays}`
      : `${formattedDays} ${daysLabel}; ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

    return timeString;
  };

  useEffect(() => {
    if (
      !item?.productPrices?.length ||
      item?.productPrices?.[0]?.sellType !== "BUYGROUP"
    ) {
      setTimeLeft(null);
      return;
    }

    const product = item.productPrices[0];
    const startTimestamp = getLocalTimestamp(
      product.dateOpen,
      product.startTime,
    );
    const endTimestamp = getLocalTimestamp(product.dateClose, product.endTime);

    const updateCountdown = () => {
      const now = Date.now();

      if (now < startTimestamp) {
        setTimeLeft(t("not_started"));
        return;
      }

      const ms = endTimestamp - now;
      if (ms <= 0) {
        setTimeLeft(t("expired"));
        return;
      }

      setTimeLeft(formatTime(ms));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [item?.productPrices, language, t]);

  return (
    <div className="product-list-s1-col">
      <div className="product-list-s1-box relative hover:bg-slate-100">
        {isSelectable ? (
          <div className="absolute left-[10px] top-[20px]">
            <Checkbox
              className="border border-solid border-gray-300 data-[state=checked]:!bg-dark-orange"
              checked={selectedIds?.includes(item.id)}
              onCheckedChange={(checked) => onSelectedId?.(checked, item.id)}
            />
          </div>
        ) : null}
        {timeLeft ? (
          <div
            className={`time_left ${language === "ar" ? "rtl" : "ltr"}`}
            translate="no"
          >
            <span dir={language === "ar" ? "rtl" : "ltr"}>{timeLeft}</span>
          </div>
        ) : null}
        <Link href={`/trending/${item.id}`}>
          {item?.askForPrice !== "true" && item.consumerDiscount ? (
            <div className="absolute right-2.5 top-14 z-10 inline-block rounded bg-dark-orange px-2 py-1.5 text-xs font-medium capitalize leading-3 text-white">
              <span>{item.consumerDiscount}%</span>
            </div>
          ) : null}
          <div className="relative mx-auto mb-4 h-36 w-36">
            <Image
              src={
                item?.productImage && validator.isURL(item.productImage)
                  ? item.productImage
                  : PlaceholderImage
              }
              alt="product-image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              blurDataURL="/images/product-placeholder.png"
              placeholder="blur"
            />
          </div>
        </Link>

        {isInteractive ? (
          <div className="mb-3 flex flex-row items-center justify-center gap-x-3">
            {item?.askForPrice !== "true" ? (
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0 shadow-md"
                onClick={() => handleAddToCart(-1, "add")}
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
            {haveAccessToken ? (
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
            ) : null}
          </div>
        ) : null}

        <Link href={`/trending/${item.id}`}>
          <div
            className="relative w-full text-sm font-normal capitalize text-color-blue lg:text-base"
            dir={langDir}
          >
            <h4 className="mb-2.5 min-h-[43px] border-b border-solid border-gray-300 pb-2.5 text-xs font-normal uppercase text-color-dark md:min-h-max">
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
            <div suppressHydrationWarning>
              <h5
                className="py-0.5 text-[#1D77D1]"
                dir={langDir}
                translate="no"
              >
                {currency.symbol}
                {calculateDiscountedPrice()}{" "}
                <span className="text-gray-500 !line-through">
                  {currency.symbol}
                  {item.productProductPrice}
                </span>
              </h5>
            </div>
          )}
        </div>
        {productVariants.length > 0 ? (
          <div className="mb-2">
            <label dir={langDir}>{productVariants[0].type}</label>
            <select
              className="w-full"
              value={selectedProductVariant?.value}
              onChange={(e) => {
                const value = e.target.value;
                const selectedVariant = productVariants.find(
                  (variant: any) => variant.value == value,
                );
                setSelectedProductVariant(selectedVariant);
                if (isAddedToCart)
                  handleAddToCart(quantity, "add", selectedVariant);
              }}
              dir={langDir}
            >
              {productVariants.map((variant: any, index: number) => (
                <option key={index} value={variant.value} dir={langDir}>
                  {variant.value}
                </option>
              ))}
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
                  updateCartWithLogin?.isPending ||
                  updateCartByDevice?.isPending
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
                  setQuantity(isNaN(value) ? productQuantity : value);
                }}
                onBlur={handleQuantityChange}
              />
              <Button
                type="button"
                variant="outline"
                className="relative hover:shadow-sm"
                onClick={() => handleQuantity(quantity + 1, "add")}
                disabled={
                  updateCartWithLogin?.isPending ||
                  updateCartByDevice?.isPending
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
              disabled={quantity == 0}
              dir={langDir}
              translate="no"
            >
              {t("add_to_cart")}
            </button>
          ) : null}
        </div>

        {sold !== undefined && sold !== null && item.productPrices?.[0]?.stock
          ? (() => {
              const percentage = Number(
                ((sold / (sold + item.productPrices[0].stock)) * 100).toFixed(),
              );
              return (
                <>
                  <div className="mt-3 h-3 w-full bg-gray-300">
                    <div
                      className="h-full bg-color-yellow"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span
                    className="w-full text-sm font-normal capitalize text-light-gray"
                    translate="no"
                  >
                    {t("sold")}: {sold}
                  </span>
                </>
              );
            })()
          : null}
      </div>
      <Dialog open={isConfirmDialogOpen} onOpenChange={handleConfirmDialog}>
        <DialogContent
          className="add-new-address-modal add_member_modal gap-0 p-0 md:!max-w-2xl"
          ref={confirmDialogRef}
        >
          <div className="modal-header !justify-between" dir={langDir}>
            <DialogTitle className="text-center text-xl font-bold text-dark-orange" />
            <Button
              onClick={onCancelRemove}
              className={`${langDir == "ltr" ? "absolute" : ""} right-2 top-2 z-10 !bg-white !text-black shadow-none`}
            >
              <IoCloseSharp size={20} />
            </Button>
          </div>
          <div className="mb-4 mt-4 text-center">
            <p className="text-dark-orange" translate="no">
              {t("do_you_want_to_remove_this_item_from_cart")}
            </p>
            <div>
              <Button
                type="button"
                className="mr-2 bg-white text-red-500"
                onClick={onCancelRemove}
                translate="no"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                className="bg-red-500"
                onClick={onConfirmRemove}
                translate="no"
              >
                {t("remove")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;
