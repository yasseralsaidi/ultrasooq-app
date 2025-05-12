"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IBrands,
  ISelectOptions,
  TrendingProduct,
} from "@/utils/types/common.types";
import { useBrands } from "@/apis/queries/masters.queries";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllBuyGroupProducts, useProductVariant } from "@/apis/queries/product.queries";
import ProductCard from "@/components/modules/trending/ProductCard";
import GridIcon from "@/components/icons/GridIcon";
import ListIcon from "@/components/icons/ListIcon";
import FilterMenuIcon from "@/components/icons/FilterMenuIcon";
import ProductTable from "@/components/modules/trending/ProductTable";
import { debounce } from "lodash";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactSlider from "react-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { stripHTML } from "@/utils/helper";
// import Image from "next/image";
// import TrendingBannerImage from "@/public/images/trending-product-inner-banner.png";
// import ChevronRightIcon from "@/public/images/nextarow.svg";
// import InnerBannerImage from "@/public/images/trending-product-inner-banner-pic.png";
import Footer from "@/components/shared/Footer";
import Pagination from "@/components/shared/Pagination";
import { useToast } from "@/components/ui/use-toast";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/apis/queries/user.queries";
import {
  useCartListByDevice,
  useCartListByUserId,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import BannerSection from "@/components/modules/trending/BannerSection";
import SkeletonProductCardLoader from "@/components/shared/SkeletonProductCardLoader";
import { useCategoryStore } from "@/lib/categoryStore";
import TrendingCategories from "@/components/modules/trending/TrendingCategories";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
// @ts-ignore
import  { startDebugger }  from "remove-child-node-error-debugger";

const TrendingPage = () => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const queryClient = useQueryClient();
  const categoryStore = useCategoryStore();
  const { toast } = useToast();
  const deviceId = getOrCreateDeviceId() || "";
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sortBy, setSortBy] = useState("desc");
  const [productFilter, setProductFilter] = useState(false);
  const [displayMyProducts, setDisplayMyProducts] = useState("0");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);
  const category = useCategoryStore();

  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);

  const me = useMe();
  const addToWishlist = useAddToWishList();
  const deleteFromWishlist = useDeleteFromWishList();
  const allProductsQuery = useAllBuyGroupProducts({
    page,
    limit,
    sort: sortBy,
    priceMin: priceRange[0] === 0 ? 0 : ((priceRange[0] || Number(minPriceInput)) ?? undefined),
    priceMax: priceRange[1] || Number(maxPriceInput) || undefined,
    brandIds: selectedBrandIds.map((item) => item.toString()).join(",") || undefined,
    userId: me?.data?.data?.tradeRole == "MEMBER" ? me?.data?.data?.addedBy : me?.data?.data?.id,
    categoryIds: category.categoryIds ? category.categoryIds : undefined,
    isOwner: displayMyProducts == "1" ? "me" : "",
  });
  const fetchProductVariant = useProductVariant();
  const brandsQuery = useBrands({
    term: searchTerm,
  });

  const memoizedBrands = useMemo(() => {
    return (
      brandsQuery?.data?.data.map((item: IBrands) => {
        return { label: item.brandName, value: item.id };
      }) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandsQuery?.data?.data?.length]);

  const handleDebounce = debounce((event: any) => {
    setSearchTerm(event.target.value);
  }, 1000);

  const handlePriceDebounce = debounce((event: any) => {
    setPriceRange(event);
  }, 1000);

  const handleMinPriceChange = debounce((event: any) => {
    setMinPriceInput(event.target.value);
    // setPriceRange([ Number(event.target.value),500]);
  }, 1000);

  const handleMaxPriceChange = debounce((event: any) => {
    setMaxPriceInput(event.target.value);
    // setPriceRange([0, Number(event.target.value)]);
  }, 1000);

  const handleBrandChange = (
    checked: boolean | string,
    item: ISelectOptions,
  ) => {
    let tempArr = selectedBrandIds || [];
    if (checked && !tempArr.find((ele: number) => ele === item.value)) {
      tempArr = [...tempArr, item.value];
    }

    if (!checked && tempArr.find((ele: number) => ele === item.value)) {
      tempArr = tempArr.filter((ele: number) => ele !== item.value);
    }
    setSelectedBrandIds(tempArr);
  };

  const memoizedProductList = useMemo(() => {
    return (
      allProductsQuery?.data?.data?.map((item: any) => {
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
          consumerDiscountType: item?.product_productPrice?.[0]?.consumerDiscountType,
          vendorDiscount: item?.product_productPrice?.[0]?.vendorDiscount,
          vendorDiscountType: item?.product_productPrice?.[0]?.vendorDiscountType,
          askForPrice: item?.product_productPrice?.[0]?.askForPrice,
          productPrices: item?.product_productPrice,
          sold: sold,
        }
      }) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allProductsQuery?.data?.data,
    allProductsQuery?.data?.data?.length,
    sortBy,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    priceRange[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    priceRange[1],
    page,
    limit,
    searchTerm,
    selectedBrandIds,
    displayMyProducts,
  ]);

  const getProductVariants = async () => {
    let productPriceIds = memoizedProductList
        .filter((item: any) => item.productPrices.length > 0)
        .map((item: any) => item.productPrices[0].id);
      
    const response = await fetchProductVariant.mutateAsync(productPriceIds);
    if (response.status) setProductVariants(response.data);
  }

  useEffect(() => {
    if (memoizedProductList.length) {
      getProductVariants();
    }
  }, [memoizedProductList]);

  const [cartList, setCartList] = useState<any[]>([]);

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

  const selectAll = () => {
    setSelectedBrandIds(
      brandsQuery?.data?.data?.map((item: any) => {
        return item.id;
      }) || [],
    );
  };

  const clearFilter = () => {
    setSelectedBrandIds([]);
    setMaxPriceInput("");
    setMinPriceInput("");
    setPriceRange([]);
    setDisplayMyProducts("0");

    if (minPriceInputRef.current) minPriceInputRef.current.value = "";
    if (maxPriceInputRef.current) maxPriceInputRef.current.value = "";
  };

  useEffect(() => {
    if (accessToken) {
      setHaveAccessToken(true);
    } else {
      setHaveAccessToken(false);
    }
  }, [accessToken]);

  useEffect(() => {
    return () => {
      categoryStore.setSubCategories([]);
      categoryStore.setSubSubCategories([]);
      categoryStore.setCategoryId('');
      categoryStore.setCategoryIds('');
      categoryStore.setSubCategoryIndex(0);
      categoryStore.setSecondLevelCategoryIndex(0);
      categoryStore.setSubCategoryParentName('');
      categoryStore.setSubSubCategoryParentName('');
    };
  }, []);

  startDebugger();

  return (
    <>
      <title dir={langDir} translate="no">{t("store")} | Ultrasooq</title>
      <div className="body-content-s1">
        <TrendingCategories />

        <BannerSection />

        <div className="trending-search-sec">
          <div className="container m-auto px-3">
            <div className={productFilter ? "left-filter show" : "left-filter"} dir={langDir}>
              <div className="all_select_button">
                <button type="button" onClick={selectAll} translate="no">
                  {t("select_all")}
                </button>
                <button type="button" onClick={clearFilter} translate="no">
                  {t("clean_select")}
                </button>
              </div>
              <Accordion
                type="multiple"
                defaultValue={["brand"]}
                className="filter-col"
              >
                <AccordionItem value="brand">
                  <AccordionTrigger className="px-3 text-base hover:!no-underline" dir={langDir} translate="no">
                    {t("by_brand")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="filter-sub-header">
                      <Input
                        type="text"
                        placeholder={t("search_brand")}
                        className="custom-form-control-s1 searchInput rounded-none"
                        onChange={handleDebounce}
                        dir={langDir}
                        translate="no"
                      />
                    </div>
                    <div className="filter-body-part">
                      <div className="filter-checklists">
                        {!memoizedBrands.length ? (
                          <p className="text-center text-sm font-medium">
                            No data found
                          </p>
                        ) : null}
                        {memoizedBrands.map((item: ISelectOptions) => (
                          <div key={item.value} className="div-li">
                            <Checkbox
                              id={item.label}
                              className="border border-solid border-gray-300 data-[state=checked]:!bg-dark-orange"
                              onCheckedChange={(checked) =>
                                handleBrandChange(checked, item)
                              }
                              checked={selectedBrandIds.includes(item.value)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={item.label}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {item.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                  <AccordionTrigger className="px-3 text-base hover:!no-underline" dir={langDir} translate="no">
                    {t("price")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4">
                      <div className="px-2">
                        <ReactSlider
                          className="horizontal-slider"
                          thumbClassName="example-thumb"
                          trackClassName="example-track"
                          defaultValue={[0, 500]}
                          ariaLabel={["Lower thumb", "Upper thumb"]}
                          ariaValuetext={(state) =>
                            `Thumb value ${state.valueNow}`
                          }
                          renderThumb={(props, state) => (
                            <div {...props} key={props.key}>
                              {state.valueNow}
                            </div>
                          )}
                          pearling
                          minDistance={10}
                          onChange={(value) => handlePriceDebounce(value)}
                          max={500}
                          min={0}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          className="mb-4"
                          onClick={() => setPriceRange([])}
                          dir={langDir}
                          translate="no"
                        >
                          {t("clear")}
                        </Button>
                      </div>
                      <div className="range-price-left-right-info">
                        <Input
                          type="number"
                          placeholder={`${currency.symbol}0`}
                          className="custom-form-control-s1 rounded-none"
                          onChange={handleMinPriceChange}
                          onWheel={(e) => e.currentTarget.blur()}
                          ref={minPriceInputRef}
                        />
                        <div className="center-divider"></div>
                        <Input
                          type="number"
                          placeholder={`${currency.symbol}500`}
                          className="custom-form-control-s1 rounded-none"
                          onChange={handleMaxPriceChange}
                          onWheel={(e) => e.currentTarget.blur()}
                          ref={maxPriceInputRef}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div
              className="left-filter-overlay"
              onClick={() => setProductFilter(false)}
            ></div>
            <div className="right-products">
              {haveAccessToken && me?.data?.data?.tradeRole != 'BUYER' ? (<RadioGroup
                className="mb-3 flex flex-row gap-y-3"
                value={displayMyProducts}
                onValueChange={setDisplayMyProducts}
                // @ts-ignore
                dir={langDir}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="0"
                    id="all_products"
                    checked={displayMyProducts == "0"}
                  />
                  <Label htmlFor="all_products" className="text-base" dir={langDir} translate="no">
                    {t("all_products")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="1"
                    id="my_products"
                    checked={displayMyProducts == "1"}
                  />
                  <Label htmlFor="my_products" className="text-base" dir={langDir} translate="no">
                    {t("my_products")}
                  </Label>
                </div>
              </RadioGroup>) : null}
              <div className="products-header-filter">
                <div className="le-info">
                  {/* TODO: need name here */}
                  {/* <h3></h3> */}
                </div>
                <div className="rg-filter">
                  <p dir={langDir} translate="no">
                    {t("n_products_found", {
                      n: allProductsQuery.data?.totalCount,
                    })}
                  </p>
                  <ul>
                    <li>
                      <Select onValueChange={(e) => setSortBy(e)}>
                        <SelectTrigger className="custom-form-control-s1 bg-white">
                          <SelectValue placeholder={t("sort_by")} dir={langDir} translate="no" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="desc" dir={langDir} translate="no">
                              {t("sort_by_latest")}
                            </SelectItem>
                            <SelectItem value="asc" dir={langDir} translate="no">
                              {t("sort_by_oldest")}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="view-type-btn"
                        onClick={() => setViewType("grid")}
                      >
                        <GridIcon active={viewType === "grid"} />
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="view-type-btn"
                        onClick={() => setViewType("list")}
                      >
                        <ListIcon active={viewType === "list"} />
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="view-type-btn"
                        onClick={() => setProductFilter(true)}
                      >
                        <FilterMenuIcon />
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {allProductsQuery.isLoading && viewType === "grid" ? (
                <div className="grid grid-cols-4 gap-5">
                  {Array.from({ length: 8 }).map((_, index: number) => (
                    <SkeletonProductCardLoader key={index} />
                  ))}
                </div>
              ) : null}

              {!memoizedProductList.length && !allProductsQuery.isLoading ? (
                <p className="text-center text-sm font-medium" dir={langDir} translate="no">
                  {t("no_data_found")}
                </p>
              ) : null}

              {viewType === "grid" ? (
                <div className="product-list-s1">
                  {memoizedProductList.map((item: TrendingProduct) => {
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
                        productVariants={
                          productVariants.find((variant: any) => variant.productId == item.id)?.object || []
                        }
                        item={item}
                        onWishlist={() =>
                          handleAddToWishlist(item.id, item?.productWishlist)
                        }
                        inWishlist={item?.inWishlist}
                        haveAccessToken={haveAccessToken}
                        isInteractive
                        productQuantity={cartItem?.quantity}
                        productVariant={cartItem?.object}
                        cartId={cartItem?.id}
                        isAddedToCart={cartItem ? true : false}
                        relatedCart={relatedCart}
                        sold={item.sold}
                      />
                    );
                  })}
                </div>
              ) : null}

              {viewType === "list" && memoizedProductList.length ? (
                <div className="product-list-s1 p-4">
                  <ProductTable list={memoizedProductList} />
                </div>
              ) : null}

              {allProductsQuery.data?.totalCount > 8 ? (
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalCount={allProductsQuery.data?.totalCount}
                  limit={limit}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrendingPage;
