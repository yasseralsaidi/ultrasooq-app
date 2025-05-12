import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import validator from "validator";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { FaCircleCheck } from "react-icons/fa6";
import ShoppingIcon from "@/components/icons/ShoppingIcon";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useDeleteCartItem, useUpdateCartWithLogin } from "@/apis/queries/cart.queries";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IoCloseSharp } from "react-icons/io5";
import { useClickOutside } from "use-events";
// import Link from "next/link";

type RfqProductCardProps = {
  id: number;
  productType: "F" | "P";
  productName: string;
  productNote: string;
  productStatus: string;
  productImages: {
    image: string;
  }[];
  productVariants?: any[];
  productQuantity: number;
  productVariant?: any;
  customizeProductId?: number;
  onAdd: () => void;
  onWishlist: () => void;
  isCreatedByMe: boolean;
  cartId?: number;
  isAddedToFactoryCart: boolean;
  inWishlist?: boolean;
  haveAccessToken: boolean;
  productPrices?: any[];
};

const FactoriesProductCard: React.FC<RfqProductCardProps> = ({
  id,
  productType,
  productName,
  productNote,
  productStatus,
  productImages,
  productVariants = [],
  productQuantity,
  productVariant,
  customizeProductId,
  onAdd,
  onWishlist,
  isCreatedByMe,
  cartId,
  isAddedToFactoryCart,
  inWishlist,
  haveAccessToken,
  productPrices,
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const [quantity, setQuantity] = useState(0);
  const [selectedProductVariant, setSelectedProductVariant] = useState<any>();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const handleConfirmDialog = () => setIsConfirmDialogOpen(!isConfirmDialogOpen);
  const confirmDialogRef = useRef(null);
  const [isClickedOutsideConfirmDialog] = useClickOutside([confirmDialogRef], (event) => { onCancelRemove() });

  useEffect(() => {
    setQuantity(productQuantity || 0);
  }, [productQuantity]);

  useEffect(() => {
    setSelectedProductVariant(productVariant || productVariants?.[0]);
  }, [productVariants, productVariant]);

  useEffect(() => {
    setSelectedProductVariant(productVariant);
  }, [productVariant]);

  const updateCartWithLogin = useUpdateCartWithLogin();
  const deleteCartItem = useDeleteCartItem();

  const handleAddToCart = async (
    quantity: number,
    action: "add" | "remove",
    variant?: any
  ) => {
    const minQuantity = productPrices?.length ? productPrices[0]?.minQuantityPerCustomer : null;
    if (action == "add" && minQuantity && minQuantity > quantity) {
      toast({
        description: t("min_quantity_must_be_n", { n: minQuantity }),
        variant: "danger",
      });
      return;
    }

    const maxQuantity = productPrices?.length ? productPrices[0]?.maxQuantityPerCustomer : null;
    if (maxQuantity && maxQuantity < quantity) {
      toast({
        description: t("max_quantity_must_be_n", { n: maxQuantity }),
        variant: "danger",
      });
      return;
    }

    if (action == "remove" && minQuantity && minQuantity > quantity) {
      setIsConfirmDialogOpen(true);
      return;
    }

    if (haveAccessToken) {
      if (!productPrices?.length || !productPrices?.[0]?.id) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }
      const response = await updateCartWithLogin.mutateAsync({
        productPriceId: productPrices?.[0]?.id,
        quantity,
        productVariant: variant || selectedProductVariant
      });

      if (response.status) {
        if (action === "add" && quantity === 0) {
          setQuantity(1);
        } else {
          setQuantity(quantity);
        }
        toast({
          title: action == "add" ? t("item_added_to_cart") : t("item_removed_from_cart"),
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

  const handleQuantity = async (quantity: number, action: "add" | "remove") => {
    const minQuantity = productPrices?.[0]?.minQuantityPerCustomer;
    const maxQuantity = productPrices?.[0]?.maxQuantityPerCustomer;

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

    const minQuantity = productPrices?.length ? productPrices[0]?.minQuantityPerCustomer : null;
    if (minQuantity && minQuantity > quantity) {
      toast({
        description: t("min_quantity_must_be_n", { n: minQuantity }),
        variant: "danger",
      });
      handleQuantity(quantity, quantity > productQuantity ? "add" : "remove");
      return;
    }

    const maxQuantity = productPrices?.length ? productPrices[0]?.maxQuantityPerCustomer : null;
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

  const calculateDiscountedPrice = () => {
    const price = productPrices?.[0]?.offerPrice ? Number(productPrices[0]?.offerPrice) : 0;
    let discount = productPrices?.[0]?.consumerDiscount || 0;
    let discountType = productPrices?.[0]?.consumerDiscountType;
    if (user?.tradeRole && user?.tradeRole != 'BUYER') {
      discount = productPrices?.[0]?.vendorDiscount || 0;
      discountType = productPrices?.[0]?.vendorDiscountType;
    }
    if (discountType == 'PERCENTAGE') {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  return (
    <div className="product_list_part">
      {/* FIXME:  link disabled due to TYPE R product. error in find one due to no price */}
      <Link href={`/trending/${id}`}>
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
      </Link>
      <div className="mb-3 flex flex-row items-center justify-center gap-x-3">
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 shadow-md"
          onClick={() => handleAddToCart(quantity + 1, "add")}
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
      <div className="product_list_content" dir={langDir}>
        <Link href={`/trending/${id}`}>
          <p>{productName}</p>
        </Link>
      </div>
      {productPrices?.[0]?.offerPrice ? (
        <h5 className="py-1 text-[#1D77D1]" dir={langDir}>
          {currency.symbol}
          {calculateDiscountedPrice()}{" "}
          <span className="text-gray-500 !line-through">
            {currency.symbol}
            {productPrices?.[0]?.offerPrice}
          </span>
        </h5>
      ) : null}
      {productVariants.length > 0 ? (
        <div className="mb-2" dir={langDir}>
          <label htmlFor="">{productVariants[0].type}</label>
          <select
            className="w-full"
            value={selectedProductVariant?.value}
            onChange={(e) => {
              let value = e.target.value;
              const selectedVariant = productVariants.find((variant: any) => variant.value == value);
              setSelectedProductVariant(selectedVariant);
              if (cartId) handleAddToCart(quantity, "add", selectedVariant)
            }}
          >
            {productVariants.map((variant: any, index: number) => {
              return <option key={index} value={variant.value} dir={langDir}>{variant.value}</option>;
            })}
          </select>
        </div>) : null}
      <div className="quantity_wrap mb-2" dir={langDir}>
        <label translate="no">{t("quantity")}</label>
        <div className="qty-up-down-s1-with-rgMenuAction">
          <div className="flex items-center gap-x-3 md:gap-x-3">
            <Button
              type="button"
              variant="outline"
              className="relative hover:shadow-sm"
              onClick={() => handleQuantity(quantity - 1, "remove")}
              disabled={quantity === 0 || updateCartWithLogin?.isPending}
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
              disabled={updateCartWithLogin?.isPending}
            >
              <Image
                src="/images/upDownBtn-plus.svg"
                alt="plus-icon"
                fill
                className="p-3"
              />
            </Button>
            {/* {!isAddedToFactoryCart && <Button
              type="button"
              variant="ghost"
              onClick={onAdd}
            >
              <div className="relative h-6 w-6">
                <Image
                  src="/images/edit-rfq.png"
                  alt="edit-rfq-icon"
                  fill
                />
              </div>
            </Button>} */}
          </div>
        </div>
      </div>

      <div className="cart_button">
        {cartId ? (
          <button
            type="button"
            className="flex items-center justify-evenly gap-x-2 rounded-sm border border-[#E8E8E8] p-[10px] text-[15px] font-bold leading-5 text-[#7F818D]"
            dir={langDir}
            translate="no"
          >
            <FaCircleCheck color="#00C48C" />
            {t("added_to_cart")}
          </button>
        ) : null}
        {!cartId ? (
          <button
            type="button"
            className="add_to_cart_button"
            onClick={() => handleAddToCart(quantity, "add")}
            disabled={quantity == 0 || updateCartWithLogin?.isPending}
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
            <DialogTitle className="text-center text-xl text-dark-orange font-bold"></DialogTitle>
            <Button
              onClick={onCancelRemove}
              className={`${langDir == 'ltr' ? 'absolute' : ''} right-2 top-2 z-10 !bg-white !text-black shadow-none`}
            >
              <IoCloseSharp size={20} />
            </Button>
          </div>

          <div className="text-center mt-4 mb-4">
            <p className="text-dark-orange">Do you want to remove this item from cart?</p>
            <div>
              <Button
                type="button"
                className="bg-white text-red-500 mr-2"
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

export default FactoriesProductCard;
