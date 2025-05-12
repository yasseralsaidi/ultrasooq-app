"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import Pagination from "@/components/shared/Pagination";
import {
  useAllRfqQuotesByBuyerId,
  useDeleteRfqQuote,
} from "@/apis/queries/rfq.queries";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/shared/Footer";
import { MONTHS } from "@/utils/constants";
import validator from "validator";
import Image from "next/image";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import Link from "next/link";
import BackgroundPreviewImage from "@/public/images/rfq-product-list-sec-bg.png";
import TrashIcon from "@/public/images/td-trash-icon.svg";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { CgDetailsMore } from "react-icons/cg";
import { Dialog } from "@/components/ui/dialog";
import DeleteContent from "@/components/shared/DeleteContent";
import { useToast } from "@/components/ui/use-toast";
import { PERMISSION_RFQ_QUOTES, checkPermission } from "@/helpers/permission";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const RfqQuotesPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const hasPermission = checkPermission(PERMISSION_RFQ_QUOTES);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>();

  const rfqQuotesByBuyerIdQuery = useAllRfqQuotesByBuyerId({
    page,
    limit,
  }, hasPermission);
  const deleteRfqQuote = useDeleteRfqQuote();

  const memoizedRfqQuotesProducts = useMemo(() => {
    return (
      rfqQuotesByBuyerIdQuery.data?.data?.map((item: any) => {
        return {
          id: item?.id,
          productImages:
            item?.rfqQuotesProducts?.map(
              (ele: any) => ele?.rfqProductDetails?.productImages?.[0]?.image,
            ) || [],
          rfqDate: item?.rfqQuotes_rfqQuoteAddress?.rfqDate || "-",
        };
      }) || []
    );
  }, [rfqQuotesByBuyerIdQuery.data?.data]);

  const formatDate = useMemo(
    () => (originalDateString: string) => {
      const originalDate = new Date(originalDateString);

      if (!originalDate || originalDate.toString() === "Invalid Date")
        return "-";

      const year = originalDate.getFullYear();
      const monthIndex = originalDate.getMonth();
      const day = originalDate.getDate();
      const hours = originalDate.getHours();
      const minutes = originalDate.getMinutes();
      const seconds = originalDate.getSeconds();
      const amOrPm = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12;
      const formattedDateString = `${MONTHS[monthIndex]} ${day}, ${year}  ${formattedHours}:${minutes}:${seconds} ${amOrPm}`;

      return formattedDateString;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memoizedRfqQuotesProducts],
  );

  const handleToggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
    setSelectedProductId(undefined);
  };

  const handleConfirmation = async (isConfirmed: boolean) => {
    if (!isConfirmed) {
      setIsDeleteModalOpen(false);
      setSelectedProductId(undefined);
      return;
    }

    if (!selectedProductId) return;

    const response = await deleteRfqQuote.mutateAsync({
      rfqQuotesId: selectedProductId,
    });
    if (response.status && response.data) {
      setIsDeleteModalOpen(false);
    }
    if (response.status && response.data) {
      toast({
        title: t("product_delete_successful"),
        description: response.message,
        variant: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedProductId(undefined);
    } else {
      toast({
        title: t("product_delete_failed"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    if (!hasPermission) router.push("/home");
  }, []);

  if (!hasPermission) return <div></div>;

  return (
    <>
      <div className="rfq-product-list-page">
        <div className="sec-bg">
          <Image src={BackgroundPreviewImage} alt="background-preview" />
        </div>
        <div className="container m-auto px-3">
          <div className="headerpart">
            <h2 dir={langDir} translate="no">{t("rfq_product")}</h2>
          </div>
          <div className="rfq-product-list-card">
            <div className="table-responsive theme-table-s1 min-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead dir={langDir} translate="no">{t("product")}</TableHead>
                    <TableHead dir={langDir} translate="no">{t("rfq_id")}</TableHead>
                    <TableHead dir={langDir} translate="no">{t("delivery_date")}</TableHead>
                    <TableHead dir={langDir} translate="no">{t("no_of_quote")}</TableHead>
                    <TableHead className="text-center" dir={langDir} translate="no">{t("action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedRfqQuotesProducts?.map((item: any) => (
                    <TableRow key={item?.id}>
                      <TableCell>
                        <Link href={`/rfq-request?rfqQuotesId=${item?.id}`}>
                          <div className="td-product-group-images">
                            {item?.productImages?.map(
                              (ele: any, index: number) => (
                                <div
                                  key={`${ele}_${index}`}
                                  className="img-item"
                                >
                                  <div className="img-container relative h-[80px] w-[80px]">
                                    <Image
                                      src={
                                        ele && validator.isURL(ele)
                                          ? ele
                                          : PlaceholderImage
                                      }
                                      fill
                                      alt="preview"
                                    />
                                  </div>
                                </div>
                              ),
                            )}
                            {/* <div className="img-item">
                            <div className="img-container">
                              <img src="/images/pro1.png" alt="" />
                            </div>
                          </div>
                          <div className="img-item">
                            <div className="img-container">
                              <img src="/images/pro2.png" alt="" />
                            </div>
                          </div>
                          <div className="img-item">
                            <div className="img-container">
                              <img src="/images/pro3.png" alt="" />
                            </div>
                          </div>
                          <div className="img-item">
                            <div className="img-container">
                              <img src="/images/pro4.png" alt="" />
                              <span>+5</span>
                            </div>
                          </div> */}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>RFQ000{item?.id}</TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(item?.rfqDate)}</p>
                      </TableCell>
                      <TableCell>0</TableCell>
                      <TableCell th-name="Action">
                        <Menubar className="w-fit px-0">
                          <MenubarMenu>
                            <MenubarTrigger>
                              <HiOutlineDotsCircleHorizontal size={24} />
                            </MenubarTrigger>
                            <MenubarContent className="min-w-0">
                              <MenubarItem>
                                <Link
                                  href={`/rfq-request?rfqQuotesId=${item?.id}`}
                                  className="td-dots-dropdown-item flex items-center gap-1"
                                  dir={langDir}
                                  translate="no"
                                >
                                  <CgDetailsMore height={24} width={24} />
                                  {t("view")}
                                </Link>
                              </MenubarItem>
                              <MenubarSeparator />
                              <MenubarItem
                                onClick={() => {
                                  handleToggleDeleteModal();
                                  setSelectedProductId(item?.id);
                                }}
                                dir={langDir}
                                translate="no"
                              >
                                <Image
                                  src={TrashIcon}
                                  height={0}
                                  width={0}
                                  alt="trash-icon"
                                  className="mr-2 h-4 w-4"
                                />
                                {t("delete")}
                              </MenubarItem>
                            </MenubarContent>
                          </MenubarMenu>
                        </Menubar>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {rfqQuotesByBuyerIdQuery?.isLoading ? (
                <div className="my-2 space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : null}

              {!memoizedRfqQuotesProducts.length &&
              !rfqQuotesByBuyerIdQuery.isLoading ? (
                <p className="py-10 text-center text-sm font-medium" dir={langDir} translate="no">
                  {t("no_product_found")}
                </p>
              ) : null}

              {rfqQuotesByBuyerIdQuery.data?.totalCount > 5 ? (
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalCount={rfqQuotesByBuyerIdQuery.data?.totalCount}
                  limit={limit}
                />
              ) : null}
            </div>
          </div>
        </div>

        <Dialog open={isDeleteModalOpen} onOpenChange={handleToggleDeleteModal}>
          <DeleteContent
            onClose={() => handleConfirmation(false)}
            onConfirm={() => handleConfirmation(true)}
            isLoading={deleteRfqQuote.isPending}
          />
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default RfqQuotesPage;
