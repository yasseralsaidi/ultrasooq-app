"use client";
import {
  useCartListByDevice,
  useCartListByUserId,
  useDeleteCartItem,
  useDeleteServiceFromCart,
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
} from "@/apis/queries/cart.queries";
import { useAddToWishList } from "@/apis/queries/wishlist.queries";
import ProductCard from "@/components/modules/cartList/ProductCard";
import ServiceCard from "@/components/modules/cartList/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { getOrCreateDeviceId } from "@/utils/helper";
import { CartItem } from "@/utils/types/cart.types";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const CartListPage = () => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth()
  const router = useRouter();
  const { toast } = useToast();
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const deviceId = getOrCreateDeviceId() || "";
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const cartListByDeviceQuery = useCartListByDevice(
    {
      page: 1,
      limit: 10,
      deviceId,
    },
    !haveAccessToken,
  );
  const cartListByUser = useCartListByUserId(
    {
      page: 1,
      limit: 10,
    },
    haveAccessToken,
  );
  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartByDevice = useUpdateCartByDevice();
  const deleteCartItem = useDeleteCartItem();
  const deleteServiceFromCart = useDeleteServiceFromCart();
  const addToWishlist = useAddToWishList();

  const memoizedCartList = useMemo(() => {
    setLoading(false);
    if (cartListByUser.data?.data) {
      return cartListByUser.data?.data || [];
    } else if (cartListByDeviceQuery.data?.data) {
      return cartListByDeviceQuery.data?.data || [];
    }
    return [];
  }, [cartListByUser.data?.data, cartListByDeviceQuery.data?.data]);

  const calculateDiscountedPrice = (
    offerPrice: string | number,
    discount: number,
    discountType?: string
  ) => {
    const price = offerPrice ? Number(offerPrice) : 0;
    if (discountType == 'PERCENTAGE') {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  const calculateTotalAmount = () => {
    if (cartListByUser.data?.data?.length) {
      return cartListByUser.data?.data?.reduce(
        (
          acc: number,
          curr: {
            cartType: "DEFAULT" | "SERVICE";
            productPriceDetails: {
              offerPrice: string;
              consumerDiscount?: number;
              consumerDiscountType?: string;
              vendorDiscount?: number;
              vendorDiscountType?: string;
            };
            quantity: number;
            cartServiceFeatures: any[];
            service: {
              eachCustomerTime: number;
            }
          },
        ) => {
          if (curr.cartType == "DEFAULT") {
            let discount = curr?.productPriceDetails?.consumerDiscount;
            let discountType = curr?.productPriceDetails?.consumerDiscountType;
            if (user?.tradeRole && user.tradeRole != 'BUYER') {
              discount = curr?.productPriceDetails?.vendorDiscount;
              discountType = curr?.productPriceDetails?.vendorDiscountType;
            }
            const calculatedDiscount = calculateDiscountedPrice(
              curr.productPriceDetails?.offerPrice ?? 0,
              discount || 0,
              discountType
            );
            return (
              Number((acc + calculatedDiscount * curr.quantity).toFixed(2))
            );
          }

          if (!curr.cartServiceFeatures?.length) return acc;

          let amount = 0;
          for (let feature of curr.cartServiceFeatures) {
            if (feature.serviceFeature?.serviceCostType == "FLAT") {
              amount += Number(feature.serviceFeature?.serviceCost || '') * (feature.quantity || 1);
            } else {
              amount += Number(feature?.serviceFeature?.serviceCost || '') * (feature.quantity || 1) * curr.service.eachCustomerTime;
            }
          }

          return Number((acc + amount).toFixed(2));
        },
        0,
      );
    } else if (cartListByDeviceQuery.data?.data?.length) {
      return cartListByDeviceQuery.data?.data?.reduce(
        (
          acc: number,
          curr: {
            cartType: "DEFAULT" | "SERVICE";
            productPriceDetails: {
              offerPrice: string;
            };
            quantity: number;
            cartServiceFeatures: any[];
            service: {
              eachCustomerTime: number;
            }
          },
        ) => {
          if (curr.cartType == "DEFAULT") {
            return (
              Number((acc + Number(curr.productPriceDetails?.offerPrice || 0) * curr.quantity).toFixed(2))
            );
          }

          if (!curr.cartServiceFeatures?.length) return acc;

          let amount = 0;
          for (let feature of curr.cartServiceFeatures) {
            if (feature.serviceFeature?.serviceCostType == "FLAT") {
              amount += Number(feature.serviceFeature?.serviceCost || '') * (feature.quantity || 1);
            } else {
              amount += Number(feature?.serviceFeature?.serviceCost || '') * (feature.quantity || 1) * curr.service.eachCustomerTime;
            }
          }

          return Number((acc + amount).toFixed(2));
        },
        0,
      );
    } else {
      return 0;
    }
  };

  const handleRemoveProductFromCart = async (cartId: number) => {
    const response = await deleteCartItem.mutateAsync({ cartId });
    if (response.status) {
      setLoading(true);
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

  const handleRemoveServiceFromCart = async (cartId: number, serviceFeatureId: number) => {
    const cartItem = memoizedCartList.find((item: any) => item.id == cartId);
    let payload: any = { cartId };
    if (cartItem?.cartServiceFeatures?.length > 1) {
      payload.serviceFeatureId = serviceFeatureId;
    }
    const response = await deleteServiceFromCart.mutateAsync(payload);
    if (response.status) {
      setLoading(true);
      toast({
        title: t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: response.message || t("item_not_removed_from_cart"),
        description: response.message || t("check_your_cart_for_more_details"),
        variant: "danger",
      });
    }
  };

  const handleAddToWishlist = async (productId: number) => {
    const response = await addToWishlist.mutateAsync({ productId });
    if (response.status) {
      toast({
        title: t("item_added_to_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: response.message || t("item_not_added_to_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    if (accessToken) {
      setHaveAccessToken(true);
    } else {
      setHaveAccessToken(false);
    }
  }, [accessToken]);

  useEffect(() => {
    setTotalAmount(calculateTotalAmount());
  }, [memoizedCartList]);

  return (
    <div className="cart-page">
      <div className="container m-auto px-3">
        <div className="headerPart" dir={langDir}>
          <div className="lediv">
            <h3 translate="no">{t("my_cart")}</h3>
          </div>
        </div>
        <div className="cart-page-wrapper">
          <div className="cart-page-left">
            <div className="bodyPart">
              <div className="card-item cart-items">
                <div className="card-inner-headerPart" dir={langDir}>
                  <div className="lediv">
                    <h3 translate="no">{t("cart_items")}</h3>
                  </div>
                </div>
                <div className="cart-item-lists">
                  {haveAccessToken &&
                  !cartListByUser.data?.data?.length &&
                  !cartListByUser.isLoading ? (
                    <div className="px-3 py-6">
                      <p className="my-3 text-center" translate="no">{t("no_cart_items")}</p>
                    </div>
                  ) : null}

                  {!haveAccessToken &&
                  !cartListByDeviceQuery.data?.data?.length &&
                  !cartListByDeviceQuery.isLoading ? (
                    <div className="px-3 py-6">
                      <p className="my-3 text-center" translate="no">{t("no_cart_items")}</p>
                    </div>
                  ) : null}

                  <div className="px-3">
                    {cartListByUser.isLoading || loading ? (
                      <div className="my-3 space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full" />
                        ))}
                      </div>
                    ) : null}

                    {!haveAccessToken && (cartListByDeviceQuery.isLoading || loading) ? (
                      <div className="my-3 space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full" />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {!loading ? (
                    memoizedCartList?.map((item: CartItem) => {
                      if (item.cartType == "DEFAULT") {
                        let relatedCart = memoizedCartList
                          ?.filter((c: any) => c.serviceId && c.cartProductServices?.length)
                          .find((c: any) => {
                              return !!c.cartProductServices
                                  .find((r: any) => r.relatedCartType == 'PRODUCT' && r.productId == item.productId);
                          });
                        return (
                          <ProductCard
                            key={item.id}
                            cartId={item.id}
                            productId={item.productId}
                            productPriceId={item.productPriceId}
                            productName={item.productPriceDetails?.productPrice_product?.productName}
                            offerPrice={item.productPriceDetails?.offerPrice}
                            productQuantity={item.quantity}
                            productVariant={item.object}
                            productImages={item.productPriceDetails?.productPrice_product?.productImages}
                            consumerDiscount={item.productPriceDetails?.consumerDiscount || 0}
                            consumerDiscountType={item.productPriceDetails?.consumerDiscountType}
                            vendorDiscount={item.productPriceDetails?.vendorDiscount || 0}
                            vendorDiscountType={item.productPriceDetails?.vendorDiscountType}
                            onRemove={handleRemoveProductFromCart}
                            onWishlist={handleAddToWishlist}
                            haveAccessToken={haveAccessToken}
                            minQuantity={item?.productPriceDetails?.minQuantityPerCustomer}
                            maxQuantity={item?.productPriceDetails?.maxQuantityPerCustomer}
                            relatedCart={relatedCart}
                          />
                        )
                      }

                      if (!item.cartServiceFeatures?.length) return null;

                      const features = item.cartServiceFeatures.map((feature: any) => ({
                        id: feature.id,
                        serviceFeatureId: feature.serviceFeatureId,
                        quantity: feature.quantity
                      }));

                      let relatedCart: any = memoizedCartList
                        ?.filter((c: any) => c.productId && c.cartProductServices?.length)
                        .find((c: any) => {
                            return !!c.cartProductServices
                                .find((r: any) => r.relatedCartType == 'SERVICE' && r.serviceId == item.serviceId);
                        });

                      return item.cartServiceFeatures.map((feature: any) => {
                        return (
                          <ServiceCard 
                            key={feature.id}
                            cartId={item.id}
                            serviceId={item.serviceId}
                            serviceFeatureId={feature.serviceFeatureId}
                            serviceFeatureName={feature.serviceFeature.name}
                            serviceCost={Number(feature.serviceFeature.serviceCost)}
                            cartQuantity={feature.quantity}
                            serviceFeatures={features}
                            relatedCart={relatedCart}
                            onRemove={() => {
                              handleRemoveServiceFromCart(item.id, feature.id);
                            }}
                          />
                        );
                      });
                    })
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="cart-page-right">
            <div className="card-item priceDetails">
              <div className="card-inner-headerPart" dir={langDir}>
                <div className="lediv">
                  <h3 translate="no">{t("price_details")}</h3>
                </div>
              </div>
              <div className="priceDetails-body">
                <ul>
                  <li dir={langDir}>
                    <p translate="no">{t("subtotal")}</p>
                    <h5>{currency.symbol}{totalAmount}</h5>
                  </li>
                  <li dir={langDir}>
                    <p translate="no">{t("shipping")}</p>
                    <h5 translate="no">{t("free")}</h5>
                  </li>
                </ul>
              </div>
              <div className="priceDetails-footer" dir={langDir}>
                <h4 translate="no">{t("total_amount")}</h4>
                <h4 className="amount-value">{currency.symbol}{totalAmount}</h4>
              </div>
            </div>
            <div className="order-action-btn">
              <Button
                onClick={() => router.push("/checkout")}
                disabled={!memoizedCartList?.length}
                className="theme-primary-btn order-btn"
                dir={langDir}
                translate="no"
              >
                {t("place_order")}
              </Button>
              {/* <Link
                href="/checkout"
                className="theme-primary-btn order-btn"
              >
                Place Order
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartListPage;
