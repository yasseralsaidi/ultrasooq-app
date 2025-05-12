"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import {
  useRfqCartListByUserId,
  useRfqProducts,
  useUpdateRfqCartWithLogin,
} from "@/apis/queries/rfq.queries";
import RfqProductCard from "@/components/modules/rfq/RfqProductCard";
import Pagination from "@/components/shared/Pagination";
import GridIcon from "@/components/icons/GridIcon";
import ListIcon from "@/components/icons/ListIcon";
import RfqProductTable from "@/components/modules/rfq/RfqProductTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddToRfqForm from "@/components/modules/rfq/AddToRfqForm";
import { useMe } from "@/apis/queries/user.queries";
import RfqCartMenu from "@/components/modules/rfq/RfqCartMenu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useClickOutside } from "use-events";
// import { useCartStore } from "@/lib/rfqStore";
// import CategoryFilterList from "@/components/modules/rfq/CategoryFilterList";
// import BrandFilterList from "@/components/modules/rfq/BrandFilterList";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import BannerImage from "@/public/images/rfq-sec-bg.png";
import SearchIcon from "@/public/images/search-icon-rfq.png";
import Footer from "@/components/shared/Footer";
import { FaPlus } from "react-icons/fa";
import SkeletonProductCardLoader from "@/components/shared/SkeletonProductCardLoader";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddToWishList,
  useDeleteFromWishList,
} from "@/apis/queries/wishlist.queries";
import { useTranslations } from "next-intl";
import BrandFilterList from "@/components/modules/rfq/BrandFilterList";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
// @ts-ignore
import  { startDebugger }  from "remove-child-node-error-debugger";

const RfqPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const wrapperRef = useRef(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchRfqTerm, setSearchRfqTerm] = useState("");
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectAllBrands, setSelectAllBrands] = useState<boolean>(false);
  const [displayMyProducts, setDisplayMyProducts] = useState("0");
  const [selectedProductId, setSelectedProductId] = useState<number>();
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [offerPriceFrom, setOfferPriceFrom] = useState<number | undefined>();
  const [offerPriceTo, setOfferPriceTo] = useState<number | undefined>();
  const [cartList, setCartList] = useState<any[]>([]);
  const addToWishlist = useAddToWishList();
  const deleteFromWishlist = useDeleteFromWishList();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isClickedOutside] = useClickOutside([wrapperRef], (event) => {});

  const handleToggleAddModal = () =>
    setIsAddToCartModalOpen(!isAddToCartModalOpen);

  const me = useMe(haveAccessToken);
  const rfqProductsQuery = useRfqProducts({
    page,
    limit,
    term: searchRfqTerm,
    adminId: me?.data?.data?.tradeRole == "MEMBER" ? me?.data?.data?.addedBy : me?.data?.data?.id,
    sortType: sortBy,
    brandIds: selectedBrandIds.join(","),
    isOwner: displayMyProducts == "1" ? "me" : "",
  });

  const rfqCartListByUser = useRfqCartListByUserId(
    {
      page: 1,
      limit: 100,
    },
    haveAccessToken,
  );

  const updateRfqCartWithLogin = useUpdateRfqCartWithLogin();

  const handleRfqDebounce = debounce((event: any) => {
    setSearchRfqTerm(event.target.value);
  }, 1000);

  const handleRFQCart = (
    quantity: number,
    productId: number,
    action: "add" | "remove",
    offerPriceFrom?: number,
    offerPriceTo?: number,
    note?: string,
  ) => {
    if (action == "remove" && quantity == 0) {
      handleAddToCart(quantity, productId, "remove", 0, 0, "");
    } else {
      handleToggleAddModal();
      setSelectedProductId(productId);
      setQuantity(quantity);
      setOfferPriceFrom(offerPriceFrom);
      setOfferPriceTo(offerPriceTo);
    }
  };

  const handleAddToCart = async (
    quantity: number,
    productId: number,
    actionType: "add" | "remove",
    offerPriceFrom?: number,
    offerPriceTo?: number,
    note?: string,
  ) => {
    const response = await updateRfqCartWithLogin.mutateAsync({
      productId,
      quantity,
      offerPriceFrom: offerPriceFrom || 0,
      offerPriceTo: offerPriceTo || 0,
      note: note || "",
    });

    if (response.status) {
      toast({
        title:
          actionType == "add"
            ? t("item_added_to_cart")
            : t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
    }
  };

  const handleCartPage = () => router.push("/rfq-cart");

  const memoizedRfqProducts = useMemo(() => {
    if (rfqProductsQuery.data?.data) {
      return (
        rfqProductsQuery.data?.data.map((item: any) => {
          return {
            ...item,
            isAddedToCart:
              item?.product_rfqCart?.length &&
              item?.product_rfqCart[0]?.quantity > 0,
            quantity:
              item?.product_rfqCart?.length &&
              item?.product_rfqCart[0]?.quantity,
          };
        }) || []
      );
    } else {
      return [];
    }
  }, [rfqProductsQuery.data?.data]);

  useEffect(() => {
    if (rfqCartListByUser.data?.data) {
      setCartList(rfqCartListByUser.data?.data?.map((item: any) => item) || []);
    }
  }, [rfqCartListByUser.data?.data]);

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
        queryKey: ["rfq-products"],
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
        queryKey: ["rfq-products"],
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
      setSelectedProductId(undefined);
      setQuantity(undefined);
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

  startDebugger();

  return (
    <>
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
                  {haveAccessToken ? (
                    <div className="rfq_add_new_product">
                      <Link
                        href="/product?productType=R"
                        className="flex items-center gap-x-2 bg-dark-orange px-3 py-2 text-sm text-white lg:text-base"
                        dir={langDir}
                        translate="no"
                      >
                        <FaPlus />
                        {t("add_new_rfq_product")}
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div className="product_section product_gray_n_box">
                  <div className="row">
                    <div className="col-lg-12 products_sec_wrap">
                      <div className="products_sec_top">
                        <div className="products_sec_top_left" dir={langDir}>
                          <h4 translate="no">{t("trending_n_high_rate_product")}</h4>
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

                      {rfqProductsQuery.isLoading && viewType === "grid" ? (
                        <div className="mt-5 grid grid-cols-4 gap-5">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <SkeletonProductCardLoader key={index} />
                          ))}
                        </div>
                      ) : null}

                      {!rfqProductsQuery?.data?.data?.length &&
                      !rfqProductsQuery.isLoading ? (
                        <p className="my-10 text-center text-sm font-medium" dir={langDir} translate="no">
                          {t("no_data_found")}
                        </p>
                      ) : null}

                      {viewType === "grid" ? (
                        <div className="product_sec_list">
                          {memoizedRfqProducts.map((item: any) => (
                            <RfqProductCard
                              key={item.id}
                              id={item.id}
                              productType={item?.productType || "-"}
                              productName={item?.productName || "-"}
                              productNote={item?.productNote || "-"}
                              productStatus={item?.status}
                              productImages={item?.productImages}
                              productQuantity={item?.quantity || 0}
                              productPrice={item?.product_productPrice}
                              offerPriceFrom={
                                cartList?.find(
                                  (el: any) => el.productId == item.id,
                                )?.offerPriceFrom
                              }
                              offerPriceTo={
                                cartList?.find(
                                  (el: any) => el.productId == item.id,
                                )?.offerPriceTo
                              }
                              onAdd={handleRFQCart}
                              onToCart={handleCartPage}
                              onEdit={() => {
                                handleToggleAddModal();
                                setSelectedProductId(item?.id);
                              }}
                              onWishlist={() =>
                                handleAddToWishlist(
                                  item.id,
                                  item?.product_wishlist,
                                )
                              }
                              isCreatedByMe={item?.userId === me.data?.data?.id}
                              isAddedToCart={item?.isAddedToCart}
                              inWishlist={item?.product_wishlist?.find(
                                (el: any) => el?.userId === me.data?.data?.id,
                              )}
                              haveAccessToken={haveAccessToken}
                            />
                          ))}
                        </div>
                      ) : null}

                      {viewType === "list" &&
                      rfqProductsQuery?.data?.data?.length ? (
                        <div className="product_sec_list">
                          <RfqProductTable
                            list={rfqProductsQuery?.data?.data}
                          />
                        </div>
                      ) : null}

                      {rfqProductsQuery.data?.totalCount > 8 ? (
                        <Pagination
                          page={page}
                          setPage={setPage}
                          totalCount={rfqProductsQuery.data?.totalCount}
                          limit={limit}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <RfqCartMenu onAdd={handleRFQCart} cartList={cartList || []} />
            </div>
          </div>
        </div>
        <Dialog open={isAddToCartModalOpen} onOpenChange={handleToggleAddModal}>
          <DialogContent
            className="add-new-address-modal gap-0 p-0 md:!max-w-2xl"
            ref={wrapperRef}
          >
            <AddToRfqForm
              onClose={() => {
                setIsAddToCartModalOpen(false);
                setSelectedProductId(undefined);
                setQuantity(undefined);
              }}
              selectedProductId={selectedProductId}
              selectedQuantity={quantity}
              offerPriceFrom={offerPriceFrom}
              offerPriceTo={offerPriceTo}
            />
          </DialogContent>
        </Dialog>
      </section>
      <Footer />
    </>
  );
};

export default RfqPage;
