import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllManagedProducts,
  useAllProducts,
} from "@/apis/queries/product.queries";
import { cn } from "@/lib/utils";
import { useMe } from "@/apis/queries/user.queries";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type ProductsProps = {
  onSelect?: (item: { [key: string]: any }) => void;
};

const Products: React.FC<ProductsProps> = ({ onSelect }) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const me = useMe();
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [productList, setProductList] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<{
    [key: string]: any;
  }>();
  const productsQuery = useAllManagedProducts(
    {
      page: page,
      limit: limit,
      selectedAdminId:
        me?.data?.data?.tradeRole == "MEMBER"
          ? me?.data?.data?.addedBy
          : undefined,
    },
    true,
  );

  useEffect(() => {
    const products = (productsQuery?.data?.data || []).map((item: any) => {
      let product = item.productPrice_product;
      item.image = null;
      if (product?.productImages?.length > 0) {
        item.image = product?.productImages[0].image;
      }
      return item;
    });
    setProductList((prevProducts: any[]) => [...prevProducts, ...products]);
    setProductsCount(
      (prevCount: number) =>
        prevCount + (productsQuery?.data?.data?.length || 0),
    );
    if (products.length > 0 && !selectedProduct) selectProduct(products[0]);
  }, [productsQuery?.data?.data, page, limit]);

  const selectProduct = (product: { [key: string]: any }) => {
    setSelectedProduct(product);
    if (onSelect) onSelect(product);
  };

  const handleScroll = (elem: any) => {
    if (
      elem.clientHeight + elem.scrollTop >= elem.scrollHeight &&
      productsCount < productsQuery?.data?.totalCount
    ) {
      setPage((prevPage: number) => prevPage + 1);
    }
  };

  return (
    <div className="w-full border-r border-solid border-gray-300 lg:w-[18%]">
      <div
        className="flex h-[55px] min-w-full items-center border-b border-solid border-gray-300 px-[10px] py-[10px] text-base font-normal text-[#333333]"
        dir={langDir}
      >
        <span translate="no">{t("product")}</span>
      </div>
      <div
        className="h-auto w-full overflow-y-auto p-4 lg:h-[720px]"
        onScroll={(e) => handleScroll(e.target)}
      >
        {productsQuery?.isLoading ? (
          <div className="my-2 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : null}

        {!productsQuery?.isLoading && !productList?.length ? (
          <div className="my-2 space-y-2">
            <p
              className="text-center text-sm font-normal text-gray-500"
              dir={langDir}
              translate="no"
            >
              {t("no_data_found")}
            </p>
          </div>
        ) : null}

        {productList?.map((item: any) => (
          <button
            type="button"
            onClick={() => selectProduct(item)}
            className={cn(
              "flex w-full flex-wrap rounded-md px-[10px] py-[20px]",
              selectedProduct?.productId == item.productId
                ? "bg-dark-orange text-white shadow-lg"
                : "",
            )}
            key={item.id}
          >
            <div className="relative h-[40px] w-[40px] rounded-full">
              <Image
                src={item.image || item.productPrice_product?.barcode}
                alt="global-icon"
                fill
                className="rounded-full"
              />
            </div>
            <div className="flex w-[calc(100%-2.5rem)] flex-wrap items-center justify-start gap-y-1 whitespace-pre-wrap break-all pl-3">
              <div className="flex w-full">
                <h4 className="text-color-[#333333] text-left text-[14px] font-normal uppercase">
                  {item.productPrice_product?.productName}
                </h4>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Products;
