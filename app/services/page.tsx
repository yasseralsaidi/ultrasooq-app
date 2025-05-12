"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    IBrands,
    ISelectOptions,
    TrendingProduct,
} from "@/utils/types/common.types";
import GridIcon from "@/components/icons/GridIcon";
import FilterMenuIcon from "@/components/icons/FilterMenuIcon";
import { Dialog } from "@/components/ui/dialog";
import { debounce } from "lodash";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Footer from "@/components/shared/Footer";
import Pagination from "@/components/shared/Pagination";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/apis/queries/user.queries";
import {
    useCartListByDevice,
    useCartListByUserId,
} from "@/apis/queries/cart.queries";
import { getOrCreateDeviceId } from "@/utils/helper";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import SkeletonProductCardLoader from "@/components/shared/SkeletonProductCardLoader";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { fetchAllServices } from "@/apis/requests/services.requests";
import { useGetAllServices } from "@/apis/queries/services.queries";
import ServiceCard from "@/components/modules/trending/ServiceCard";
import ServiceTable from "@/components/modules/trending/ServiceTable";
import AddServiceToCartModal from "@/components/modules/serviceDetails/AddServiceToCartModal";

interface ServicesProps {
    searchParams?: { term?: string };
}

const Services = ({ searchParams }: ServicesProps) => {
    const t = useTranslations();
    const { langDir, currency } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const router = useRouter();
    const deviceId = getOrCreateDeviceId() || "";
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [productFilter, setProductFilter] = useState(false);
    const [sortBy, setSortBy] = useState("desc");
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [haveAccessToken, setHaveAccessToken] = useState(false);
    const [isServiceAddToCartModalOpen, setIsServiceAddToCartModalOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<any>(null);
    const accessToken = getCookie(PUREMOON_TOKEN_KEY);

    const searchUrlTerm = searchParams?.term || "";

    const me = useMe();
    const allServicesQuery = useGetAllServices({
        page,
        limit,
        term: searchTerm,
    });

    const handleServiceToCartModal = () => {
        setIsServiceAddToCartModalOpen((prev) => !prev)
    }

    const memoizedServicesList = useMemo(() => {
        return allServicesQuery?.data?.data?.services || [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        allServicesQuery?.data?.data,
        allServicesQuery?.data?.data?.length,
        sortBy,
        searchUrlTerm,
        page,
        limit,
        searchTerm,
    ]);

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

    const handleSearchService = debounce((event: any) => {
        setSearchTerm(event.target.value);
    }, 1000);

    useEffect(() => {
        if (accessToken) {
            setHaveAccessToken(true);
        } else {
            setHaveAccessToken(false);
        }
    }, [accessToken]);

    useEffect(() => {

    }, []);

    return (
        <>
            <title dir={langDir} translate="no">{t("store")} | Ultrasooq</title>
            <div className="body-content-s1">
                <div className="trending-search-sec">
                    <div className="container m-auto px-3">
                        <div className="right-products">
                            <div className="existing-product-add-headerPart">
                                {/* <h2
                                    className="text-2xl font-medium capitalize text-color-dark"
                                    dir={langDir}
                                    translate="no"
                                >
                                    {t("services")}
                                </h2> */}
                                <ul className="right-filter-lists flex flex-row flex-wrap gap-2 md:flex-nowrap">
                                    <li className="w-full sm:w-auto">
                                        <Input
                                            type="text"
                                            placeholder={t("search_service")}
                                            className="search-box h-[40px] w-full sm:w-[160px] lg:w-80"
                                            onChange={handleSearchService}
                                            dir={langDir}
                                            translate="no"
                                        />
                                    </li>
                                    <li className="flex">
                                        <button
                                            className="theme-primary-btn add-btn p-2"
                                            onClick={() => router.replace("/cart")}
                                            dir={langDir}
                                            translate="no"
                                        >
                                            <span className="d-none-mobile" translate="no">{t("go_to_cart")}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="products-header-filter">
                                <div className="le-info">
                                </div>
                                <div className="rg-filter">
                                    <p dir={langDir} translate="no">
                                        {t("n_services_found", {
                                            n: allServicesQuery.data?.data?.total,
                                        })}
                                    </p>
                                    <ul>
                                        <li>
                                            <Select onValueChange={(e) => setSortBy(e)} disabled={true}>
                                                <SelectTrigger className="custom-form-control-s1 bg-white">
                                                    <SelectValue placeholder={t("sort_by")} dir={langDir} />
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
                                                onClick={() => setProductFilter(true)}
                                            >
                                                <FilterMenuIcon />
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {allServicesQuery.isLoading && viewType === "grid" ? (
                                <div className="grid grid-cols-4 gap-5">
                                    {Array.from({ length: 8 }).map((_, index: number) => (
                                        <SkeletonProductCardLoader key={index} />
                                    ))}
                                </div>
                            ) : null}

                            {!memoizedServicesList.length && !allServicesQuery.isLoading ? (
                                <p className="text-center text-sm font-medium" dir={langDir} translate="no">
                                    {t("no_data_found")}
                                </p>
                            ) : null}

                            {viewType === "grid" ? (
                                <div className="product-list-s1">
                                    {memoizedServicesList.map((item: TrendingProduct) => {
                                        return (
                                            <ServiceCard
                                                key={item.id}
                                                item={item}
                                                handleServiceToCartModal={() => {
                                                    setSelectedServiceId(item.id.toString());
                                                    handleServiceToCartModal();
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ) : null}

                            {viewType === "list" && memoizedServicesList.length ? (
                                <div className="product-list-s1 p-4">
                                    <ServiceTable list={memoizedServicesList} />
                                </div>
                            ) : null}

                            {allServicesQuery.data?.data?.total > page ? (
                                <Pagination
                                    page={page}
                                    setPage={setPage}
                                    totalCount={allServicesQuery.data?.data?.total}
                                    limit={limit}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
            {(() => {
                if (!selectedServiceId) return null;

                return (
                    <Dialog open={isServiceAddToCartModalOpen} onOpenChange={handleServiceToCartModal}>
                        {(() => {
                            let relatedCart: any = null;
                            const cartItem = cartList.find((item: any) => item.serviceId == selectedServiceId);
                            if (cartItem) {
                                relatedCart = cartList
                                    ?.filter((item: any) => item.productId && item.cartProductServices?.length)
                                    .find((item: any) => {
                                        return !!item.cartProductServices
                                            .find((c: any) => c.relatedCartType == 'SERVICE' && c.serviceId == selectedServiceId);
                                    });
                            }

                            return (
                                <AddServiceToCartModal
                                    id={selectedServiceId}
                                    open={isServiceAddToCartModalOpen}
                                    features={
                                        cartList.find((item: any) => item.serviceId == selectedServiceId)
                                            ?.cartServiceFeatures
                                            ?.map((feature: any) => ({
                                                id: feature.serviceFeatureId,
                                                quantity: feature.quantity
                                            })) || []
                                    }
                                    cartId={cartList.find((item: any) => item.serviceId == selectedServiceId)?.id}
                                    relatedCart={relatedCart}
                                    handleClose={() => {
                                        setSelectedServiceId(undefined);
                                        setIsServiceAddToCartModalOpen(false)
                                    }}
                                />
                            );
                        })()}
                    </Dialog>
                )
            })()}
            <Footer />
        </>
    );
};

export default Services;
