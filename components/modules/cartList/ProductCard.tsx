import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import MinusIcon from "@/public/images/upDownBtn-minus.svg";
import PlusIcon from "@/public/images/upDownBtn-plus.svg";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/use-toast";
import {
  useDeleteCartItem,
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
  useUpdateCartWithService,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IoCloseSharp } from "react-icons/io5";
import { useClickOutside } from "use-events";

type ProductCardProps = {
  cartId: number;
  productId: number;
  productPriceId: number;
  productName: string;
  offerPrice: string;
  productQuantity: number;
  productVariant: any;
  productImages: { id: number; image: string }[];
  onRemove: (args0: number) => void;
  onWishlist: (args0: number) => void;
  haveAccessToken: boolean;
  consumerDiscount: number;
  consumerDiscountType?: string;
  vendorDiscount: number;
  vendorDiscountType?: string;
  minQuantity?: number;
  maxQuantity?: number;
  relatedCart?: any;
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
  onRemove,
  onWishlist,
  haveAccessToken,
  consumerDiscount,
  consumerDiscountType,
  vendorDiscount,
  vendorDiscountType,
  minQuantity,
  maxQuantity,
  relatedCart
}) => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedProductVariant, setSelectedProductVariant] = useState<any>();
  const deviceId = getOrCreateDeviceId() || "";
  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartWithService = useUpdateCartWithService();
  const updateCartByDevice = useUpdateCartByDevice();
  const deleteCartItem = useDeleteCartItem();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const handleConfirmDialog = () => setIsConfirmDialogOpen(!isConfirmDialogOpen);
  const confirmDialogRef = useRef(null);
  const [isClickedOutsideConfirmDialog] = useClickOutside([confirmDialogRef], (event) => { onCancelRemove() });

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

  useEffect(() => {
    setSelectedProductVariant(productVariant);
  }, [productVariant]);

  const handleAddToCart = async (
    newQuantity: number,
    actionType: "add" | "remove",
  ) => {
    if (minQuantity && minQuantity > newQuantity) {
      toast({
        description: t("min_quantity_must_be_n", { n: minQuantity }),
        variant: "danger",
      });
      setQuantity(productQuantity);
      return;
    }

    if (maxQuantity && maxQuantity < newQuantity) {
      toast({
        description: t("max_quantity_must_be_n", { n: maxQuantity }),
        variant: "danger",
      });
      setQuantity(productQuantity);
      return;
    }

    if (haveAccessToken) {
      if (!productPriceId) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }

      if (actionType == "add" && quantity == 0) {
        newQuantity = minQuantity ?? 1;
      }

      const response = await updateCartWithLogin.mutateAsync({
        productPriceId,
        quantity: newQuantity,
        productVariant: selectedProductVariant
      });

      if (response.status) {
        setQuantity(newQuantity);
        toast({
          title: actionType == "add" ? t("item_added_to_cart") : t("item_removed_from_cart"),
          description: t("check_your_cart_for_more_details"),
          variant: "success",
        });
        return response.status;
      }
    } else {
      if (!productPriceId) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }
      const response = await updateCartByDevice.mutateAsync({
        productPriceId,
        quantity: newQuantity,
        deviceId,
        productVariant: selectedProductVariant
      });
      if (response.status) {
        setQuantity(quantity);
        toast({
          title: actionType == "add" ? t("item_added_to_cart") : t("item_removed_from_cart"),
          description: t("check_your_cart_for_more_details"),
          variant: "success",
        });
        return response.status;
      }
    }
  };

  const handleQuantityChange = () => {
    if (quantity == 0 && productQuantity != 0) {
      toast({
        description: t("quantity_can_not_be_0"),
        variant: "danger",
      });
      setQuantity(productQuantity);
      return;
    }

    const action = quantity > productQuantity ? "add" : "remove";
    if (quantity != productQuantity) handleAddToCart(quantity, action);
  };

  const onConfirmRemove = () => {
    if (cartId) onRemove(cartId);
    setIsConfirmDialogOpen(false);
  };

  const onCancelRemove = () => {
    setQuantity(productQuantity);
    setIsConfirmDialogOpen(false);
  };

  return (
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
        <figcaption dir={langDir}>
          <h4 className="!text-lg !font-bold">{productName}</h4>
          <div className="custom-form-group">
            <label dir={langDir} translate="no">{t("quantity")}</label>
            <div className="qty-up-down-s1-with-rgMenuAction">
              <div className="flex items-center gap-x-1">
                <Button
                  variant="outline"
                  className="relative border border-solid border-gray-300 hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity - 1);
                    handleAddToCart(quantity - 1, "remove");
                  }}
                  disabled={
                    quantity === 0 ||
                    updateCartByDevice?.isPending ||
                    updateCartWithLogin?.isPending
                  }
                >
                  <Image
                    src={MinusIcon}
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
                  variant="outline"
                  className="relative border border-solid border-gray-300 hover:shadow-sm"
                  onClick={() => {
                    setQuantity(quantity + 1);
                    handleAddToCart(quantity + 1, "add");
                  }}
                  disabled={
                    updateCartByDevice?.isPending ||
                    updateCartWithLogin?.isPending
                  }
                >
                  <Image src={PlusIcon} alt="plus-icon" fill className="p-3" />
                </Button>
              </div>
              <ul className="rgMenuAction-lists">
                <li>
                  <Button
                    variant="ghost"
                    className="px-2 underline"
                    onClick={() => setIsConfirmDialogOpen(true)}
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
        <h5 dir={langDir}>
          {currency.symbol}
          {quantity * calculateDiscountedPrice()}
        </h5>
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

export default ProductCard;
