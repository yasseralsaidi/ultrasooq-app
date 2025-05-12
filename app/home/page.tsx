"use client";
import DealsCard from "@/components/modules/home/DealsCard";
import ProductCardHome from "@/components/modules/home/ProductCard";
import TrendingCard from "@/components/modules/home/TrendingCard";
import TrendingOptionCard from "@/components/modules/home/TrendingOptionCard";
import ProductCard from "@/components/modules/trending/ProductCard";
import Footer from "@/components/shared/Footer";
import {
  bestSellerList,
  camerasVideosList,
  computerTechnologyList,
  dealsList,
  homeElectronicsList,
  trendingList,
  trendingTopicList,
} from "@/utils/dummyDatas";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import HeadphoneImage from "@/public/images/big-headphone.png";
import AdBannerOne from "@/public/images/hs-1.png";
import AdBannerTwo from "@/public/images/hs-2.png";
import AdBannerThree from "@/public/images/hs-3.png";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  useAllBuyGroupProducts,
  useAllProducts,
} from "@/apis/queries/product.queries";
import { useEffect, useMemo, useState } from "react";
import { useMe } from "@/apis/queries/user.queries";
import { TrendingProduct } from "@/utils/types/common.types";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import {
  useCartListByDevice,
  useCartListByUserId,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { useCategoryStore } from "@/lib/categoryStore";
import { useRouter } from "next/navigation";
import { useCategory } from "@/apis/queries/category.queries";
// @ts-ignore
import { startDebugger } from "remove-child-node-error-debugger";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Home",
// };

function HomePage() {
  const t = useTranslations();
  const { currency, langDir } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const categoryStore = useCategoryStore();
  const [cartList, setCartList] = useState<any[]>();
  const deviceId = getOrCreateDeviceId() || "";
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);

  const addToWishlist = useAddToWishList();
  const deleteFromWishlist = useDeleteFromWishList();

  const me = useMe();

  useEffect(() => {
    if (accessToken) {
      setHaveAccessToken(true);
    } else {
      setHaveAccessToken(false);
    }
  }, [accessToken]);

  const categoryQuery = useCategory("4");

  const memoizedCategories = useMemo(() => {
    let tempArr: any = [];
    if (categoryQuery.data?.data) {
      tempArr = categoryQuery.data.data?.children;
    }
    return tempArr || [];
  }, [categoryQuery?.data?.data]);

  const buyGroupProductsQuery = useAllBuyGroupProducts({
    page: 1,
    limit: 4,
    sort: "desc",
  });

  const memoizedBuyGroupProducts = useMemo(() => {
    return (
      buyGroupProductsQuery?.data?.data?.map((item: any) => {
        let sold = 0;
        if (item.orderProducts?.length) {
          item.orderProducts.forEach((product: any) => {
            sold += product?.orderQuantity || 0;
          });
        }

        return {
          id: item.id,
          productName: item?.productName || "-",
          productPrice: item?.productPrice || 0,
          offerPrice: item?.offerPrice || 0,
          productImage: item?.product_productPrice?.[0]
            ?.productPrice_productSellerImage?.length
            ? item?.product_productPrice?.[0]
              ?.productPrice_productSellerImage?.[0]?.image
            : item?.productImages?.[0]?.image,
          categoryName: item?.category?.name || "-",
          skuNo: item?.skuNo,
          brandName: item?.brand?.brandName || "-",
          productReview: item?.productReview || [],
          productWishlist: item?.product_wishlist || [],
          inWishlist: item?.product_wishlist?.find(
            (ele: any) => ele?.userId === me.data?.data?.id,
          ),
          shortDescription: item?.product_productShortDescription?.length
            ? item?.product_productShortDescription?.[0]?.shortDescription
            : "-",
          productProductPriceId: item?.product_productPrice?.[0]?.id,
          productProductPrice: item?.product_productPrice?.[0]?.offerPrice,
          consumerDiscount: item?.product_productPrice?.[0]?.consumerDiscount,
          askForPrice: item?.product_productPrice?.[0]?.askForPrice,
          productPrices: item?.product_productPrice,
          sold: sold,
        };
      }) || []
    );
  }, [buyGroupProductsQuery?.data?.data]);

  const homeDecorProductsQuery = useAllProducts({
    page: 1,
    limit: 4,
    sort: "desc",
    categoryIds: "203",
  });

  const memoizedHomeDecorProducts = useMemo(() => {
    return (
      homeDecorProductsQuery?.data?.data?.map((item: any) => ({
        id: item.id,
        productName: item?.productName || "-",
        productPrice: item?.productPrice || 0,
        offerPrice: item?.offerPrice || 0,
        productImage: item?.product_productPrice?.[0]
          ?.productPrice_productSellerImage?.length
          ? item?.product_productPrice?.[0]
            ?.productPrice_productSellerImage?.[0]?.image
          : item?.productImages?.[0]?.image,
        categoryName: item?.category?.name || "-",
        skuNo: item?.skuNo,
        brandName: item?.brand?.brandName || "-",
        productReview: item?.productReview || [],
        productWishlist: item?.product_wishlist || [],
        inWishlist: item?.product_wishlist?.find(
          (ele: any) => ele?.userId === me.data?.data?.id,
        ),
        shortDescription: item?.product_productShortDescription?.length
          ? item?.product_productShortDescription?.[0]?.shortDescription
          : "-",
        productProductPriceId: item?.product_productPrice?.[0]?.id,
        productProductPrice: item?.product_productPrice?.[0]?.offerPrice,
        consumerDiscount: item?.product_productPrice?.[0]?.consumerDiscount,
        askForPrice: item?.product_productPrice?.[0]?.askForPrice,
        productPrices: item?.product_productPrice,
      })) || []
    );
  }, [homeDecorProductsQuery?.data?.data]);

  const fashionBeautyProductsQuery = useAllProducts({
    page: 1,
    limit: 4,
    sort: "desc",
    categoryIds: "258",
  });

  const memoizedFashionBeautyProducts = useMemo(() => {
    return (
      fashionBeautyProductsQuery?.data?.data?.map((item: any) => ({
        id: item.id,
        productName: item?.productName || "-",
        productPrice: item?.productPrice || 0,
        offerPrice: item?.offerPrice || 0,
        productImage: item?.product_productPrice?.[0]
          ?.productPrice_productSellerImage?.length
          ? item?.product_productPrice?.[0]
            ?.productPrice_productSellerImage?.[0]?.image
          : item?.productImages?.[0]?.image,
        categoryName: item?.category?.name || "-",
        skuNo: item?.skuNo,
        brandName: item?.brand?.brandName || "-",
        productReview: item?.productReview || [],
        productWishlist: item?.product_wishlist || [],
        inWishlist: item?.product_wishlist?.find(
          (ele: any) => ele?.userId === me.data?.data?.id,
        ),
        shortDescription: item?.product_productShortDescription?.length
          ? item?.product_productShortDescription?.[0]?.shortDescription
          : "-",
        productProductPriceId: item?.product_productPrice?.[0]?.id,
        productProductPrice: item?.product_productPrice?.[0]?.offerPrice,
        consumerDiscount: item?.product_productPrice?.[0]?.consumerDiscount,
        askForPrice: item?.product_productPrice?.[0]?.askForPrice,
        productPrices: item?.product_productPrice,
      })) || []
    );
  }, [fashionBeautyProductsQuery?.data?.data]);

  const consumerElectronicsProductsQuery = useAllProducts({
    page: 1,
    limit: 4,
    sort: "desc",
    categoryIds: "269,270",
  });

  const memoizedConsumerElectronicsProducts = useMemo(() => {
    return (
      consumerElectronicsProductsQuery?.data?.data?.map((item: any) => ({
        id: item.id,
        productName: item?.productName || "-",
        productPrice: item?.productPrice || 0,
        offerPrice: item?.offerPrice || 0,
        productImage: item?.product_productPrice?.[0]
          ?.productPrice_productSellerImage?.length
          ? item?.product_productPrice?.[0]
            ?.productPrice_productSellerImage?.[0]?.image
          : item?.productImages?.[0]?.image,
        categoryName: item?.category?.name || "-",
        skuNo: item?.skuNo,
        brandName: item?.brand?.brandName || "-",
        productReview: item?.productReview || [],
        productWishlist: item?.product_wishlist || [],
        inWishlist: item?.product_wishlist?.find(
          (ele: any) => ele?.userId === me.data?.data?.id,
        ),
        shortDescription: item?.product_productShortDescription?.length
          ? item?.product_productShortDescription?.[0]?.shortDescription
          : "-",
        productProductPriceId: item?.product_productPrice?.[0]?.id,
        productProductPrice: item?.product_productPrice?.[0]?.offerPrice,
        consumerDiscount: item?.product_productPrice?.[0]?.consumerDiscount,
        askForPrice: item?.product_productPrice?.[0]?.askForPrice,
        productPrices: item?.product_productPrice,
      })) || []
    );
  }, [consumerElectronicsProductsQuery?.data?.data]);

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

  const cartListByDeviceQuery = useCartListByDevice(
    {
      page: 1,
      limit: 20,
      deviceId,
    },
    !haveAccessToken,
  );

  const cartListByUser = useCartListByUserId(
    {
      page: 1,
      limit: 20,
    },
    haveAccessToken,
  );

  useEffect(() => {
    if (cartListByUser.data?.data) {
      setCartList((cartListByUser.data?.data || []).map((item: any) => item));
    } else if (cartListByDeviceQuery.data?.data) {
      setCartList(
        (cartListByDeviceQuery.data?.data || []).map((item: any) => item),
      );
    }
  }, [cartListByUser.data?.data, cartListByDeviceQuery.data?.data]);

  startDebugger();
  return (
    <>
      <section className="w-full py-8">
        <div className="container m-auto px-3">
          <div className="flex flex-wrap">
            <div className="mb-4 w-full sm:mb-0 sm:w-1/2 sm:pr-3.5">
              <div className="relative h-auto w-full sm:h-96">
                <Image
                  src={AdBannerOne}
                  className="static h-full w-full object-cover object-right-top"
                  alt="hs-1"
                  fill
                />
                <div className="relative left-0 top-0 flex h-full w-full items-center justify-start bg-gradient-to-r from-slate-100 to-transparent p-8 md:absolute">
                  <div className="text-sm font-normal text-light-gray md:w-10/12 lg:w-9/12">
                    <h6 className="m-0 text-sm font-normal uppercase text-dark-orange">
                      SAMSUNG
                    </h6>
                    <h3 className="mb-2.5 text-2xl font-medium capitalize text-color-dark lg:text-4xl">
                      sed do eiusmod tempor incididunt
                    </h3>
                    <p>Only 2 days:</p>
                    <h5 className="mb-5 text-lg font-semibold text-olive-green">
                      21/10 &amp; 22/10
                    </h5>
                    <a
                      href="#"
                      className="inline-block rounded-sm bg-dark-orange px-6 py-3 text-sm font-bold text-white"
                    >
                      {" "}
                      Shop Now{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 sm:pl-3.5">
              <div className="relative mb-4 h-auto w-full sm:mb-8 sm:h-44">
                <Image
                  src={AdBannerTwo}
                  className="static h-full w-full object-cover"
                  alt="hs-2"
                  fill
                />
                <div className="relative left-0 top-0 flex h-full w-full items-center justify-start bg-gradient-to-r from-slate-100 to-transparent px-8 py-4 md:absolute">
                  <div className="w-4/5 text-sm font-normal text-light-gray lg:w-3/5">
                    <h3 className="mb-2.5 text-xl font-medium capitalize text-color-dark lg:text-2xl">
                      <b>Fluence</b> Minimal Speaker
                    </h3>
                    <p>Just Price</p>
                    <h5 className="mb-5 text-lg font-semibold text-olive-green" translate="no">
                      {currency.symbol}159.99
                    </h5>
                  </div>
                </div>
              </div>
              <div className="relative h-auto w-full sm:h-44">
                <Image
                  src={AdBannerThree}
                  className="static h-full w-full object-cover"
                  alt="hs-3"
                  fill
                />
                <div className="relative left-0 top-0 flex h-full w-full items-center justify-start bg-gradient-to-r from-slate-100 to-transparent px-8 py-2 md:absolute">
                  <div className="w-4/5 text-sm font-normal text-light-gray lg:w-3/5">
                    <h6 className="m-0 text-xs font-normal uppercase text-dark-orange">
                      CAMERA
                    </h6>
                    <h3 className="text-2xl font-medium capitalize text-color-dark">
                      <b>Camera</b> Sale
                    </h3>
                    <span className="mb-1.5 block text-xl font-medium capitalize text-dark-orange lg:text-2xl">
                      20% OFF
                    </span>
                    <p>Just Price</p>
                    <h5 className="mb-5 text-lg font-semibold text-olive-green" translate="no">
                      {currency.symbol}159.99
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full pb-4 pt-8">
        <div className="container m-auto px-3">
          <div className="flex flex-wrap">
            <div className="mb-5 w-full" dir={langDir}>
              <h3 className="text-lg font-normal capitalize text-color-dark md:text-2xl">
                Search Trending
              </h3>
            </div>
            <div className="w-full">
              <div className="bg-neutral-100 p-4 lg:p-8">
                <div className="block w-full">
                  <ul className="mb-2 grid grid-cols-3 gap-3 border-b border-solid border-gray-300 sm:grid-cols-5 md:grid-cols-8">
                    {trendingTopicList.map((item: any) => (
                      <TrendingOptionCard key={uuidv4()} item={item} />
                    ))}
                  </ul>
                </div>
                <div className="block w-full py-5">
                  <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    {trendingList.map((item) => (
                      <TrendingCard key={uuidv4()} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {memoizedBuyGroupProducts?.length > 0 ? (
        <section className="w-full pb-8 pt-0">
          <div className="container m-auto px-3">
            <div className="flex flex-wrap">
              <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-gray-300 pb-3.5">
                <div className="flex flex-wrap items-center justify-start">
                  <h4 className="mr-3 whitespace-nowrap text-lg font-normal capitalize text-color-dark md:mr-6 md:text-2xl" translate="no">
                    {t("deal_of_the_day")}
                  </h4>
                  {/* <span className="rounded bg-dark-orange px-3 py-1.5 text-sm font-medium capitalize text-white md:px-5 md:py-2.5 md:text-lg">
                  End in: 26:22:00:19
                </span> */}
                </div>
                <div className="flex flex-wrap items-center justify-end">
                  <Link
                    href="/buygroup"
                    className="mr-3.5 text-sm font-normal text-black underline sm:mr-0"
                    translate="no"
                  >
                    {t("view_all")}
                  </Link>
                </div>
              </div>
              <div className="product-list-s1 w-full">
                {memoizedBuyGroupProducts.map((item: TrendingProduct) => {
                  const cartItem =  cartList?.find((el: any) => el.productId == item.id);
                  let relatedCart: any = null;
                  if (cartItem) {
                    relatedCart = cartList
                      ?.filter((c: any) => c.serviceId && c.cartProductServices?.length)
                      .find((c: any) => {
                          return !!c.cartProductServices
                              .find((r: any) => r.relatedCartType == 'PRODUCT' && r.productId == item.id);
                      });
                  }
                  return (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onWishlist={() =>
                        handleAddToWishlist(item.id, item?.productWishlist)
                      }
                      inWishlist={item?.inWishlist}
                      haveAccessToken={haveAccessToken}
                      isInteractive
                      cartId={cartItem?.id}
                      productQuantity={cartItem?.quantity}
                      productVariant={cartItem?.object}
                      isAddedToCart={cartItem ? true : false}
                      relatedCart={relatedCart}
                      sold={item.sold}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* <section className="w-full py-8">
        <div className="container m-auto px-3">
          <div className="flex flex-wrap">
            <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-gray-300 bg-neutral-100 px-3.5 py-3.5">
              <div className="flex flex-wrap items-center justify-start">
                <h4 className="mr-3 whitespace-nowrap text-lg font-normal capitalize text-color-dark md:mr-6 md:text-2xl">
                  Best Seller In The Last Month
                </h4>
              </div>
              <div className="flex flex-wrap items-center justify-start sm:justify-end">
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:mr-0"
                >
                  Iphone
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Ipad
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Samsung
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  View all
                </a>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 pt-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {bestSellerList.map((item: any) => (
                <ProductCard key={uuidv4()} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      <section className="w-full py-8">
        <div className="container m-auto">
          <div className="flex">
            <div className="relative flex w-full flex-wrap bg-neutral-100 px-5 py-6 md:py-12 lg:px-10 lg:py-24">
              <div className="sm:w-12/12 w-12/12 flex flex-wrap content-center items-center pr-3.5 md:w-6/12">
                <h3 className="text-xl font-normal capitalize leading-8 text-color-dark md:text-2xl md:leading-10 lg:text-4xl" dir={langDir}>
                  Contrary to popular belief, Lorem Ipsum is not..
                </h3>
                <p className="text-base font-normal capitalize text-light-gray" dir={langDir}>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.{" "}
                </p>
              </div>
              <div className="w-12/12 flex flex-wrap content-center items-center px-3.5 sm:w-4/12 md:w-3/12" dir={langDir}>
                <h6 className="mb-1.5 text-base font-medium uppercase text-color-dark line-through" translate="no">
                  {currency.symbol}332.38
                </h6>
                <h4 className="w-full text-3xl font-medium uppercase text-olive-green" translate="no">
                  <span className="line-through">{currency.symbol}</span>219.05
                </h4>
                <div className="mt-5">
                  <a
                    href="#"
                    className="inline-block rounded-sm bg-dark-orange px-6 py-3 text-sm font-bold text-white"
                  >
                    Shop Now{" "}
                  </a>
                </div>
              </div>
              <div className="w-12/12 flex pl-3.5 sm:w-8/12 md:w-3/12">
                <div className="static bottom-0 right-0 top-0 m-auto h-full max-h-full w-auto max-w-full md:absolute">
                  <Image
                    src={HeadphoneImage}
                    className="h-[320px] w-[276px] object-cover"
                    alt="Big Headphone"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {memoizedHomeDecorProducts?.length > 0 ? (
        <section className="w-full py-8">
          <div className="container m-auto">
            <div className="flex flex-wrap">
              <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-gray-300 bg-neutral-100 px-3.5 py-3.5">
                <div className="flex flex-wrap items-center justify-start">
                  <h4 className="mr-3 whitespace-nowrap text-xl font-normal capitalize text-color-dark md:mr-6 md:text-2xl" translate="no">
                    {t("home_decor")}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center justify-start sm:justify-end">
                  {/* <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:mr-0"
                >
                  Laptop
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Desktop PC
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Smartphone
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Mainboars
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  PC Gaming
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Accessories
                </a> */}
                  <a
                    onClick={() => {
                      const categoryId = 203;
                      const subCategoryIndex = memoizedCategories.findIndex(
                        (item: any) => item.id == categoryId,
                      );
                      const item = memoizedCategories.find(
                        (item: any) => item.id == categoryId,
                      );
                      categoryStore.setSubCategories(
                        memoizedCategories?.[subCategoryIndex]?.children,
                      );
                      categoryStore.setCategoryId(categoryId.toString());
                      categoryStore.setSubCategoryIndex(subCategoryIndex);
                      categoryStore.setSubCategoryParentName(item?.name);
                      categoryStore.setSubSubCategoryParentName(
                        memoizedCategories?.[subCategoryIndex]?.children?.[0]
                          ?.name,
                      );
                      categoryStore.setSubSubCategories(
                        memoizedCategories?.[subCategoryIndex]?.children?.[0]
                          ?.children,
                      );
                      categoryStore.setSecondLevelCategoryIndex(0);
                      categoryStore.setCategoryIds(categoryId.toString());
                      router.push("/trending");
                    }}
                    className="mr-3.5 cursor-pointer text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                    translate="no"
                  >
                    {t("view_all")}
                  </a>
                </div>
              </div>
              <div className="product-list-s1 w-full">
                {memoizedHomeDecorProducts.map((item: TrendingProduct) => {
                  const cartItem = cartList?.find((el: any) => el.productId == item.id);
                  let relatedCart: any = null;
                  if (cartItem) {
                    relatedCart = cartList
                      ?.filter((c: any) => c.serviceId && c.cartProductServices?.length)
                      .find((c: any) => {
                        return !!c.cartProductServices
                          .find((r: any) => r.relatedCartType == 'PRODUCT' && r.productId == item.id);
                      });
                  }
                  return (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onWishlist={() =>
                        handleAddToWishlist(item.id, item?.productWishlist)
                      }
                      inWishlist={item?.inWishlist}
                      haveAccessToken={haveAccessToken}
                      isInteractive
                      cartId={cartItem?.id}
                      productQuantity={cartItem?.quantity}
                      productVariant={cartItem?.object}
                      isAddedToCart={cartItem ? true : false}
                      relatedCart={relatedCart}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {memoizedFashionBeautyProducts?.length > 0 ? (
        <section className="w-full py-8">
          <div className="container m-auto">
            <div className="flex flex-wrap">
              <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-gray-300 bg-neutral-100 px-3.5 py-3.5">
                <div className="flex flex-wrap items-center justify-start">
                  <h4 className="mr-3 whitespace-nowrap text-xl font-normal capitalize text-color-dark md:mr-6 md:text-2xl" translate="no">
                    {t("fashion_n_beauty")}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center justify-start sm:justify-end">
                  {/* <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:mr-0"
                >
                  Smart
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  TV LED
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Air Conditions
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Sony Speakers
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Panasonic Refrigerations
                </a> */}
                  <a
                    onClick={() => {
                      const categoryId = 258;
                      const subCategoryIndex = memoizedCategories.findIndex(
                        (item: any) => item.id == categoryId,
                      );
                      const item = memoizedCategories.find(
                        (item: any) => item.id == categoryId,
                      );
                      categoryStore.setSubCategories(
                        memoizedCategories?.[subCategoryIndex]?.children,
                      );
                      categoryStore.setCategoryId(categoryId.toString());
                      categoryStore.setSubCategoryIndex(subCategoryIndex);
                      categoryStore.setSubCategoryParentName(item?.name);
                      categoryStore.setSubSubCategoryParentName(
                        memoizedCategories?.[subCategoryIndex]?.children?.[0]
                          ?.name,
                      );
                      categoryStore.setSubSubCategories(
                        memoizedCategories?.[subCategoryIndex]?.children?.[0]
                          ?.children,
                      );
                      categoryStore.setSecondLevelCategoryIndex(0);
                      categoryStore.setCategoryIds(categoryId.toString());
                      router.push("/trending");
                    }}
                    className="mr-3.5 cursor-pointer text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                    translate="no"
                  >
                    {t("view_all")}
                  </a>
                </div>
              </div>
              <div className="product-list-s1 w-full">
                {memoizedFashionBeautyProducts.map((item: TrendingProduct) => {
                  const cartItem = cartList?.find((el: any) => el.productId == item.id);
                  let relatedCart: any = null;
                  if (cartItem) {
                    relatedCart = cartList
                      ?.filter((c: any) => c.serviceId && c.cartProductServices?.length)
                      .find((c: any) => {
                        return !!c.cartProductServices
                          .find((r: any) => r.relatedCartType == 'PRODUCT' && r.productId == item.id);
                      });
                  }
                  return (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onWishlist={() =>
                        handleAddToWishlist(item.id, item?.productWishlist)
                      }
                      inWishlist={item?.inWishlist}
                      haveAccessToken={haveAccessToken}
                      isInteractive
                      cartId={cartItem?.id}
                      productQuantity={cartItem?.quantity}
                      productVariant={cartItem?.object}
                      isAddedToCart={cartItem ? true : false}
                      relatedCart={relatedCart}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {memoizedConsumerElectronicsProducts.length > 0 ? (
        <section className="w-full py-8">
          <div className="container m-auto">
            <div className="flex flex-wrap">
              <div className="flex w-full flex-wrap items-center justify-between border-b border-solid border-gray-300 bg-neutral-100 px-3.5 py-3.5">
                <div className="flex flex-wrap items-center justify-start">
                  <h4 className="mr-3 whitespace-nowrap text-xl font-normal capitalize text-color-dark md:mr-6 md:text-2xl" translate="no">
                    {t("consumer_electronics")}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center justify-start sm:justify-end">
                  {/* <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:mr-0"
                >
                  Videos
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Projectors
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Digital Cameras
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Printers & Scanners
                </a>
                <a
                  href="#"
                  className="mr-3.5 text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                >
                  Accessories
                </a> */}
                  <a
                    onClick={() => {
                      const categoryId = 269;
                      const subCategoryId = 270;
                      const categoryIds = "269,270";
                      const subCategoryIndex = memoizedCategories.findIndex(
                        (item: any) => item.id == categoryId,
                      );
                      const item = memoizedCategories.find(
                        (item: any) => item.id == categoryId,
                      );
                      const children =
                        memoizedCategories?.[subCategoryIndex]?.children || [];
                      categoryStore.setSubCategories(children);
                      categoryStore.setSubCategoryIndex(subCategoryIndex);
                      categoryStore.setSubCategoryParentName(item?.name);
                      const itemSubCategory = children.find(
                        (item: any) => item.id == subCategoryId,
                      );
                      categoryStore.setSubSubCategoryParentName(
                        itemSubCategory?.name,
                      );
                      categoryStore.setSubSubCategories(
                        itemSubCategory?.children,
                      );
                      categoryStore.setSecondLevelCategoryIndex(
                        children.findIndex(
                          (item: any) => item.id == subCategoryId,
                        ),
                      );
                      categoryStore.setCategoryId(subCategoryId.toString());
                      categoryStore.setCategoryIds(categoryIds);
                      router.push("/trending");
                    }}
                    className="mr-3.5 cursor-pointer text-sm font-normal text-black sm:ml-3.5 sm:mr-0"
                    translate="no"
                  >
                    {t("view_all")}
                  </a>
                </div>
              </div>
              <div className="product-list-s1 w-full">
                {memoizedConsumerElectronicsProducts.map(
                  (item: TrendingProduct) => {
                    const cartItem = cartList?.find((el: any) => el.productId == item.id);
                    let relatedCart: any = null;
                    if (cartItem) {
                      relatedCart = cartList
                        ?.filter((c: any) => c.serviceId && c.cartProductServices?.length)
                        .find((c: any) => {
                          return !!c.cartProductServices
                            .find((r: any) => r.relatedCartType == 'PRODUCT' && r.productId == item.id);
                        });
                    }
                    return (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onWishlist={() =>
                          handleAddToWishlist(item.id, item?.productWishlist)
                        }
                        inWishlist={item?.inWishlist}
                        haveAccessToken={haveAccessToken}
                        isInteractive
                        cartId={cartItem?.id}
                        productQuantity={cartItem?.quantity}
                        productVariant={cartItem?.object}
                        isAddedToCart={cartItem ? true : false}
                        relatedCart={relatedCart}
                      />
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}

export default HomePage;
