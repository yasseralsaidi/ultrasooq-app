import React, { useEffect, useMemo, useState } from "react";
import SameBrandProductCard from "./SameBrandProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { stripHTML } from "@/utils/helper";
import { Skeleton } from "@/components/ui/skeleton";
import { useSameBrandProducts } from "@/apis/queries/product.queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useMe } from "@/apis/queries/user.queries";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import {
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type SameBrandSectionProps = {
  productDetails: any;
  productId?: string;
};

const SameBrandSection: React.FC<SameBrandSectionProps> = ({
  productDetails,
  productId,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deviceId = getOrCreateDeviceId() || "";
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);

  const me = useMe();
  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartByDevice = useUpdateCartByDevice();
  const addToWishlist = useAddToWishList();
  const deleteFromWishlist = useDeleteFromWishList();
  const sameBrandProductsQuery = useSameBrandProducts(
    {
      page: 1,
      limit: 10,
      brandIds: productDetails?.brandId,
      userId: me.data?.data?.id,
      productId,
    },
    !!productDetails?.brandId && !!productId,
  );

  const memoizedSameBrandProductList = useMemo(() => {
    return (
      sameBrandProductsQuery?.data?.data?.map((item: any) => ({
        ...item,
        productImages: item?.product_productPrice?.[0]
          ?.productPrice_productSellerImage?.length
          ? item?.product_productPrice?.[0]?.productPrice_productSellerImage
          : item?.productImages,
        shortDescription: item?.product_productShortDescription?.length
          ? item?.product_productShortDescription?.[0]?.shortDescription
          : "-",
        productWishlist: item?.product_wishlist || [],
        inWishlist: item?.product_wishlist?.find(
          (ele: any) => ele?.userId === me.data?.data?.id,
        ),
        productProductPriceId: item?.product_productPrice?.[0]?.id,
        productProductPrice: item?.product_productPrice?.[0]?.offerPrice,
        consumerDiscount: item?.product_productPrice?.[0]?.consumerDiscount,
        consumerDiscountType: item?.product_productPrice?.[0]?.consumerDiscountType,
        vendorDiscount: item?.product_productPrice?.[0]?.vendorDiscount,
        vendorDiscountType: item?.product_productPrice?.[0]?.vendorDiscountType,
        askForPrice: item?.product_productPrice?.[0]?.askForPrice,
      })) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sameBrandProductsQuery?.data?.data,
    me.data?.data?.id,
    sameBrandProductsQuery?.isFetched,
    productDetails?.brandId,
  ]);

  const handleAddToCart = async (quantity: number, productPriceId?: number) => {
    if (haveAccessToken) {
      if (!productPriceId) {
        toast({
          title: t("something_went_wrong"),
          description: t("product_price_id_not_found"),
          variant: "danger",
        });
        return;
      }
      const response = await updateCartWithLogin.mutateAsync({
        productPriceId,
        quantity,
      });

      if (response.status) {
        toast({
          title: t("item_added_to_cart"),
          description: t("check_your_cart_for_more_details"),
          variant: "success",
        });
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
        quantity,
        deviceId,
      });
      if (response.status) {
        toast({
          title: t("item_added_to_cart"),
          description: t("check_your_cart_for_more_details"),
          variant: "success",
        });
        return response.status;
      }
    }
  };

  const handleDeleteFromWishlist = async (productId: number) => {
    const response = await deleteFromWishlist.mutateAsync({
      productId,
    });
    if (response.status) {
      toast({
        title: t("item_removed_from_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "product-by-id",
          { productId: String(productId), userId: me.data?.data?.id },
        ],
      });
    } else {
      toast({
        title: t("item_not_removed_from_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "danger",
      });
    }
  };

  const handleAddToWishlist = async (
    productId: number,
    wishlistArr?: any[],
  ) => {
    const wishlistObject = wishlistArr?.find(
      (item) => item.userId === me.data?.data?.id,
    );
    // return;
    if (wishlistObject) {
      handleDeleteFromWishlist(wishlistObject?.productId);
      return;
    }

    const response = await addToWishlist.mutateAsync({
      productId,
    });
    if (response.status) {
      toast({
        title: t("item_added_to_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "product-by-id",
          { productId: String(productId), userId: me.data?.data?.id },
        ],
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

  return (
    <div className="suggestion-list-s1-col">
      <div className="suggestion-same-branch-lists-s1">
        <div className="title-headerpart">
          <h3 dir={langDir} translate="no">{t("same_brand")}</h3>
        </div>
        <div className="contnet-bodypart min-h-[460px]">
          {!sameBrandProductsQuery?.isFetched ? (
            <Skeleton className="h-[420px] w-full" />
          ) : null}

          <div className="product-list-s1 outline-style">
            {sameBrandProductsQuery?.isFetched &&
            memoizedSameBrandProductList?.length ? (
              <Carousel
                opts={{ align: "start", loop: true }}
                orientation="vertical"
                className="w-full max-w-xs"
              >
                <CarouselContent className="-mt-1 h-[420px]">
                  {memoizedSameBrandProductList?.map((item: any) => (
                    <CarouselItem key={item?.id} className="pt-1 md:basis-1/2">
                      <div className="p-1">
                        <SameBrandProductCard
                          id={item?.id}
                          productName={item?.productName}
                          productImages={item?.productImages}
                          shortDescription={
                            item?.shortDescription
                              ? stripHTML(item?.shortDescription)
                              : "-"
                          }
                          offerPrice={item?.offerPrice}
                          productProductPrice={item?.productProductPrice}
                          productPrice={item?.productPrice}
                          productReview={item?.productReview}
                          onAdd={() =>
                            handleAddToCart(-1, item.productProductPriceId)
                          }
                          onWishlist={() =>
                            handleAddToWishlist(item.id, item?.productWishlist)
                          }
                          inWishlist={item?.inWishlist}
                          haveAccessToken={haveAccessToken}
                          consumerDiscount={item?.consumerDiscount}
                          consumerDiscountType={item?.consumerDiscountType}
                          vendorDiscount={item?.vendorDiscount}
                          vendorDiscountType={item?.vendorDiscountType}
                          askForPrice={item?.askForPrice}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="top-0" />
                <CarouselNext className="bottom-0" />
              </Carousel>
            ) : null}

            {sameBrandProductsQuery?.isFetched &&
            !memoizedSameBrandProductList?.length ? (
              <div className="w-full text-center">
                <h3 dir={langDir} translate="no">{t("no_product_found")}</h3>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SameBrandSection;
