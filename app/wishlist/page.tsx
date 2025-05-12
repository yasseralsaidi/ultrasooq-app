"use client";
import React, { useState } from "react";
import Footer from "@/components/shared/Footer";
import BannerImage from "@/public/images/rfq-sec-bg.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdOutlineChevronLeft } from "react-icons/md";
import { Button } from "@/components/ui/button";
import WishlistCard from "@/components/modules/wishlist/WishlistCard";
import {
  useDeleteFromWishList,
  useWishlist,
} from "@/apis/queries/wishlist.queries";
import { useToast } from "@/components/ui/use-toast";
import Pagination from "@/components/shared/Pagination";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/apis/queries/user.queries";
import SkeletonProductCardLoader from "@/components/shared/SkeletonProductCardLoader";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const WishlistPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const wishlistQuery = useWishlist({ page, limit });
  const deleteFromWishlist = useDeleteFromWishList();
  const queryClient = useQueryClient();

  const me = useMe();

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

  return (
    <>
      <title dir={langDir} translate="no">{t("wishlist")} | Ultrasooq</title>
      <section className="w-full py-[50px]">
        <div className="absolute left-0 top-0 -z-10 h-full w-full">
          <Image src={BannerImage} alt="background-banner" fill />
        </div>
        <div className="container m-auto px-3">
          <div>
            <div className="mb-4 flex items-center gap-x-4">
              <Button
                variant="outline"
                className="px-1"
                onClick={() => router.back()}
              >
                <MdOutlineChevronLeft size="24" />
              </Button>
              <h3 className="text-3xl font-semibold" dir={langDir} translate="no">{t("my_wishlist")}</h3>
            </div>
            <div className="min-h-[400px] rounded-2xl border border-solid border-[#E4E3E3] bg-white p-4 shadow-[0px_4px_23px_0px_#EEF1F5]">
              {wishlistQuery.data?.data?.length ? (
                <p className="px-5 text-xl font-medium" dir={langDir} translate="no">
                  {t("my_wishlist")} {wishlistQuery.data?.data?.length} items
                </p>
              ) : null}

              {!wishlistQuery.isLoading && !wishlistQuery.data?.data?.length ? (
                <p className="mt-10 text-center text-xl font-medium" dir={langDir} translate="no">
                  {t("no_wishlist_items")}
                </p>
              ) : null}

              {wishlistQuery.isLoading ? (
                <div className="grid gap-5 p-5 md:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonProductCardLoader key={index} />
                  ))}
                </div>
              ) : null}

              {wishlistQuery.data?.data?.length ? (
                <div className="grid gap-5 p-5 md:grid-cols-5">
                  {wishlistQuery.data?.data.map((item: any) => (
                    <WishlistCard
                      key={item?.id}
                      id={item?.id}
                      productId={item?.productId}
                      wishlistData={item?.wishlist_productDetail}
                      onDeleteFromWishlist={handleDeleteFromWishlist}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            {wishlistQuery.data?.totalCount > 10 ? (
              <Pagination
                page={page}
                setPage={setPage}
                totalCount={wishlistQuery.data?.totalCount}
                limit={limit}
              />
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default WishlistPage;
