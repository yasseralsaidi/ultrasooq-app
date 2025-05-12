"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import {
  useAddCustomizeProduct,
  useFactoriesProducts,
  useUpdateFactoriesCartWithLogin,
} from "@/apis/queries/rfq.queries";
import Pagination from "@/components/shared/Pagination";
import GridIcon from "@/components/icons/GridIcon";
import ListIcon from "@/components/icons/ListIcon";
import RfqProductTable from "@/components/modules/rfq/RfqProductTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMe } from "@/apis/queries/user.queries";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useClickOutside } from "use-events";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import BannerImage from "@/public/images/rfq-sec-bg.png";
import SearchIcon from "@/public/images/search-icon-rfq.png";
import Footer from "@/components/shared/Footer";
import SkeletonProductCardLoader from "@/components/shared/SkeletonProductCardLoader";
import FactoriesProductCard from "@/components/modules/factories/FactoriesProductCard";
import { useQueryClient } from "@tanstack/react-query";
import FactoryCartMenu from "@/components/modules/factories/FactoriesCartMenu";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import { useTranslations } from "next-intl";
import { useCartListByUserId } from "@/apis/queries/cart.queries";
import BrandFilterList from "@/components/modules/rfq/BrandFilterList";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AddToCustomizeForm from "@/components/modules/factories/AddToCustomizeForm";
import { useAuth } from "@/context/AuthContext";
import { useProductVariant } from "@/apis/queries/product.queries";

const FactoriesPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const wrapperRef = useRef(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchRfqTerm, setSearchRfqTerm] = useState("");
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectAllBrands, setSelectAllBrands] = useState<boolean>(false);
  const [displayMyProducts, setDisplayMyProducts] = useState("0");
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [cartList, setCartList] = useState<any[]>([]);
  const [factoriesCartList, setFactoriesCartList] = useState<any[]>([]);
  const addToWishlist = useAddToWishList();
  const deleteFromWishlist = useDeleteFromWishList();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isAddToFactoryModalOpen, setIsAddToFactoryModalOpen] = useState(false);
  const [selectedCustomizedProduct, setSelectedCustomizedProduct] = useState<{
    [key: string]: any;
  }>();

  const [isClickedOutside] = useClickOutside([wrapperRef], (event) => {});
  const handleToggleAddModal = () =>
    setIsAddToFactoryModalOpen(!isAddToFactoryModalOpen);

  const me = useMe(haveAccessToken);
  const factoriesProductsQuery = useFactoriesProducts({
    page,
    limit,
    term: searchRfqTerm,
    adminId: me?.data?.data?.tradeRole == "MEMBER" ? me?.data?.data?.addedBy : me?.data?.data?.id,
    sortType: sortBy,
    brandIds: selectedBrandIds.join(","),
    isOwner: displayMyProducts == "1" ? "me" : "",
  });
  const fetchProductVariant = useProductVariant();
  const cartListByUser = useCartListByUserId(
    {
      page: 1,
      limit: 100,
    },
    haveAccessToken,
  );
  const addCustomizeProduct = useAddCustomizeProduct();
  const updateFactoriesCartWithLogin = useUpdateFactoriesCartWithLogin();

  const handleRfqDebounce = debounce((event: any) => {
    setSearchRfqTerm(event.target.value);
  }, 1000);

  const handleAddToFactories = (productId: number) => {
    const item = factoriesCartList.find((el: any) => el.productId == productId);
    setSelectedCustomizedProduct({
      id: productId,
      customizedProductId: item?.customizeProductId,
      quantity: item?.quantity,
      fromPrice: item?.customizeProductDetail?.fromPrice,
      toPrice: item?.customizeProductDetail?.toPrice,
      note: item?.customizeProductDetail?.note,
    });
    handleToggleAddModal();
  };

  const memoizedRfqProducts = useMemo(() => {
    if (factoriesProductsQuery.data?.data) {
      return (
        factoriesProductsQuery.data?.data.map((item: any) => {
          return {
            ...item,
            isAddedToFactoryCart:
              item?.product_rfqCart?.length &&
              item?.product_rfqCart[0]?.quantity > 0,
            factoryCartQuantity: item?.product_rfqCart?.length
              ? item.product_rfqCart[0].quantity
              : 0,
          };
        }) || []
      );
    } else {
      return [];
    }
  }, [factoriesProductsQuery.data?.data]);

  const getProductVariants = async () => {
    let productPriceIds = memoizedRfqProducts
        .filter((item: any) => item.product_productPrice.length > 0)
        .map((item: any) => item.product_productPrice[0].id);
      
    const response = await fetchProductVariant.mutateAsync(productPriceIds);
    if (response.status) setProductVariants(response.data);
  }

  useEffect(() => {
    if (memoizedRfqProducts.length) {
      getProductVariants();
    }
  }, [memoizedRfqProducts]);

  useEffect(() => {
    if (cartListByUser.data?.data) {
      setCartList((cartListByUser.data?.data || []).map((item: any) => item));
    }
  }, [cartListByUser.data?.data]);

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
        queryKey: ["factoriesProducts"],
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
        queryKey: ["factoriesProducts"],
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
    if (isClickedOutside) {
      setSelectedCustomizedProduct(undefined);
    }
  }, [isClickedOutside]);

  const selectAll = () => {
    setSelectAllBrands(true);
  };

  const clearFilter = () => {
    setSelectAllBrands(false);
    setSearchRfqTerm("");
    setSelectedBrandIds([]);
    setDisplayMyProducts("0");

    if (searchInputRef?.current) searchInputRef.current.value = "";
  };

  useEffect(() => {
    if (accessToken) {
      setHaveAccessToken(true);
    } else {
      setHaveAccessToken(false);
    }
  }, [accessToken]);

  return (
    <div>
      <title dir={langDir} translate="no">{t("rfq")} | Ultrasooq</title>
      <section className="rfq_section">
        <div className="sec-bg relative">
          <Image src={BannerImage} alt="background-banner" fill />
        </div>
        <div className="rfq-container px-3">
          <div className="row">
            <div className="rfq_main_box !justify-center">
              <div className="rfq_left" dir={langDir}>
                <div className="all_select_button">
                  <button type="button" onClick={selectAll} translate="no">
                    {t("select_all")}
                  </button>
                  <button type="button" onClick={clearFilter} translate="no">
                    {t("clean_select")}
                  </button>
                </div>
                <BrandFilterList
                  selectAllBrands={selectAllBrands}
                  selectedBrandsCount={selectedBrandIds.length}
                  onSelectBrands={(brandIds: number[]) =>
                    setSelectedBrandIds(brandIds)
                  }
                />
              </div>
              <div className="rfq_middle">
                {me?.data?.data?.tradeRole != 'BUYER' ? (<RadioGroup
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
                <div className="rfq_middle_top">
                  <div className="rfq_search">
                    <input
                      type="search"
                      className="form-control"
                      placeholder={t("search_product")}
                      onChange={handleRfqDebounce}
                      ref={searchInputRef}
                      dir={langDir}
                      translate="no"
                    />
                    <button type="button">
                      <Image
                        src={SearchIcon}
                        height={14}
                        width={14}
                        alt="search-icon"
                      />
                    </button>
                  </div>
                </div>
                <div className="product_section product_gray_n_box">
                  <div className="row">
                    <div className="col-lg-12 products_sec_wrap">
                      <div className="products_sec_top">
                        <div className="products_sec_top_left">
                          <h4 dir={langDir} translate="no">{t("trending_n_high_rate_product")}</h4>
                        </div>
                        <div className="products_sec_top_right">
                          <div className="trending_filter">
                            <Select
                              onValueChange={(e: any) => setSortBy(e)}
                              defaultValue={sortBy}
                            >
                              <SelectTrigger className="custom-form-control-s1 bg-white">
                                <SelectValue placeholder={t("sort_by")} dir={langDir} translate="no" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="newest" dir={langDir} translate="no">
                                    {t("sort_by_latest")}
                                  </SelectItem>
                                  <SelectItem value="oldest" dir={langDir} translate="no">
                                    {t("sort_by_oldest")}
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="trending_view">
                            <ul>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setViewType("grid")}
                                >
                                  <GridIcon active={viewType === "grid"} />
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setViewType("list")}
                                >
                                  <ListIcon active={viewType === "list"} />
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {factoriesProductsQuery.isLoading &&
                      viewType === "grid" ? (
                        <div className="mt-5 grid grid-cols-4 gap-5">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <SkeletonProductCardLoader key={index} />
                          ))}
                        </div>
                      ) : null}

                      {!factoriesProductsQuery?.data?.data?.length &&
                      !factoriesProductsQuery.isLoading ? (
                        <p className="my-10 text-center text-sm font-medium" dir={langDir} translate="no">
                          {t("no_data_found")}
                        </p>
                      ) : null}

                      {viewType === "grid" ? (
                        <div className="product_sec_list">
                          {memoizedRfqProducts.map((item: any) => {
                            return (
                              <FactoriesProductCard
                                key={item.id}
                                id={item.id}
                                productType={item?.productType || "-"}
                                productName={item?.productName || "-"}
                                productNote={item?.productNote || "-"}
                                productStatus={item?.status}
                                productImages={item?.productImages}
                                productVariants={
                                  productVariants.find((variant: any) => variant.productId == item.id)?.object || []
                                }
                                productQuantity={
                                  cartList.find(
                                    (el: any) => el.productId == item.id,
                                  )?.quantity || 0
                                }
                                productVariant={
                                  cartList.find(
                                    (el: any) => el.productId == item.id,
                                  )?.object
                                }
                                customizeProductId={
                                  factoriesCartList.find(
                                    (el: any) => el.productId == item.id,
                                  )?.customizeProductId
                                }
                                onAdd={() => handleAddToFactories(item.id)}
                                onWishlist={() =>
                                  handleAddToWishlist(
                                    item.id,
                                    item?.product_wishlist,
                                  )
                                }
                                isCreatedByMe={
                                  item?.userId === me.data?.data?.id
                                }
                                cartId={
                                  cartList.find(
                                    (el: any) => el.productId == item.id,
                                  )?.id
                                }
                                isAddedToFactoryCart={
                                  factoriesCartList.find(
                                    (el: any) => el.productId == item.id,
                                  ) ? true : false
                                }
                                inWishlist={item?.product_wishlist?.find(
                                  (el: any) => el?.userId === me.data?.data?.id,
                                )}
                                haveAccessToken={haveAccessToken}
                                productPrices={item?.product_productPrice}
                              />
                            );
                          })}
                        </div>
                      ) : null}

                      {viewType === "list" &&
                      factoriesProductsQuery?.data?.data?.length ? (
                        <div className="product_sec_list">
                          <RfqProductTable
                            list={factoriesProductsQuery?.data?.data}
                          />
                        </div>
                      ) : null}

                      {factoriesProductsQuery.data?.totalCount > 8 ? (
                        <Pagination
                          page={page}
                          setPage={setPage}
                          totalCount={factoriesProductsQuery.data?.totalCount}
                          limit={limit}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <FactoryCartMenu
                onInitCart={setFactoriesCartList}
                haveAccessToken={haveAccessToken}
              />
            </div>
          </div>
        </div>

        {/* add to factories modal */}
        {selectedCustomizedProduct?.id ? (<Dialog open={isAddToFactoryModalOpen} onOpenChange={handleToggleAddModal}>
          <DialogContent
            className="add-new-address-modal gap-0 p-0 md:!max-w-2xl"
            ref={wrapperRef}
          >
            <AddToCustomizeForm
              selectedProductId={selectedCustomizedProduct?.id}
              onClose={() => {
                setIsAddToFactoryModalOpen(false);
                setSelectedCustomizedProduct(undefined);
              }}
              onAddToFactory={() => {
                // Refetch the listing API after a successful response
                queryClient.invalidateQueries({ queryKey: ["factoriesProducts"], exact: false });
              }}
            />
          </DialogContent>
        </Dialog>) : null}

      </section>
      <Footer />
    </div>
  );
};

export default FactoriesPage;
