import React, { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { stripHTML } from "@/utils/helper";
import { useMe } from "@/apis/queries/user.queries";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRelatedProducts } from "@/apis/queries/product.queries";
import {
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type RelatedProductsSectionProps = {
  calculateTagIds: string;
  productId?: string;
};

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({
  calculateTagIds,
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
  const relatedProductsQuery = useRelatedProducts(
    {
      page: 1,
      limit: 10,
      tagIds: calculateTagIds,
      userId: me.data?.data?.id,
      productId,
    },
    !!calculateTagIds,
  );

  const memoizedRelatedProductList = useMemo(() => {
    return (
      relatedProductsQuery?.data?.data?.map((item: any) => ({
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
    relatedProductsQuery?.data?.data,
    me.data?.data?.id,
    relatedProductsQuery?.isFetched,
    calculateTagIds,
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          // initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="w-full py-8">
      <div className="container m-auto">
        <div className="products-header-filter">
          <div className="le-info">
            <h3 dir={langDir} translate="no">{t("related_products")}</h3>
          </div>
        </div>

        {relatedProductsQuery?.isFetched &&
        memoizedRelatedProductList?.length ? (
          <Slider className="related_slider w-full" {...settings}>
            {memoizedRelatedProductList?.map((item: any) => (
              <div className="p-1" key={item?.id}>
                <ProductCard
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
                  onAdd={() => handleAddToCart(-1, item?.productProductPriceId)}
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
            ))}
          </Slider>
        ) : null}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
