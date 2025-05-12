"use client";
import React from "react";
import { BiSolidCircle, BiCircle } from "react-icons/bi";
import { PiStarFill } from "react-icons/pi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdHelpCenter } from "react-icons/md";
import { useOrderById } from "@/apis/queries/orders.queries";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import OtherItemCard from "@/components/modules/myOrderDetails/OtherItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { MONTHS, formattedDate } from "@/utils/constants";
import { cn } from "@/lib/utils";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import ReviewForm from "@/components/shared/ReviewForm";
// import { useMe } from "@/apis/queries/user.queries";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { convertDate, convertTime } from "@/utils/helper";

const MyOrderDetailsPage = ({ }) => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const searchParams = useParams();
  // const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // const [reviewId, setReviewId] = useState<number>();

  // const handleToggleReviewModal = () =>
  //   setIsReviewModalOpen(!isReviewModalOpen);

  // const me = useMe();
  const orderByIdQuery = useOrderById(
    {
      orderProductId: searchParams?.id ? (searchParams.id as string) : "",
    },
    !!searchParams?.id,
  );
  const orderDetails = orderByIdQuery.data?.data;
  const shippingDetails =
    orderByIdQuery.data?.data?.orderProduct_order?.order_orderAddress.find(
      (item: { addressType: "SHIPPING" | "BILLING" }) =>
        item?.addressType === "SHIPPING",
    );
  const billingDetails =
    orderByIdQuery.data?.data?.orderProduct_order?.order_orderAddress.find(
      (item: { addressType: "SHIPPING" | "BILLING" }) =>
        item?.addressType === "BILLING",
    );
  const otherOrderDetails =
    orderByIdQuery.data?.otherData?.[0]?.order_orderProducts;

  function formatDate(inputDate: string): string {
    const dateObj = new Date(inputDate);
    const dayOfWeek = dateObj.toLocaleString("en", { weekday: "short" });
    const dayOfMonth = dateObj.getDate();
    const month = MONTHS[dateObj.getMonth()];

    // Function to add suffix to day of the month
    function getDaySuffix(day: number): string {
      if (day >= 11 && day <= 13) {
        return `${day}th`;
      }
      switch (day % 10) {
        case 1:
          return `${day}st`;
        case 2:
          return `${day}nd`;
        case 3:
          return `${day}rd`;
        default:
          return `${day}th`;
      }
    }

    const dayWithSuffix = getDaySuffix(dayOfMonth);

    return `${dayOfWeek}, ${dayWithSuffix} ${month}`;
  }

  return (
    <>
      <div className="my-order-main">
        <div className="container m-auto px-3">
          <div className="my-order-wrapper">
            <div className="right-div mx-w-100">
              <div className="my-order-lists for-delivery-address">
                <ul className="page-indicator-s1 !mb-0">
                  <li>
                    <Link href="/home" dir={langDir} translate="no">{t("home")}</Link>
                  </li>
                  <li>
                    <Link href="/my-orders" dir={langDir} translate="no">{t("my_orders")}</Link>
                  </li>
                  <li>
                    <h5>
                      <span className="font-semibold">
                        {orderDetails?.orderProduct_order?.orderNo}
                      </span>
                    </h5>
                  </li>
                </ul>

                {orderByIdQuery.isLoading ? (
                  <Skeleton className="h-44" />
                ) : (
                  <div className="my-order-item">
                    <div className="my-order-card">
                      <div className="delivery-address">
                        <div className="delivery-address-col deliveryAddress">
                          <h2 dir={langDir} translate="no">{t("delivery_address")}</h2>
                          <h3 dir={langDir}>
                            {shippingDetails?.firstName}{" "}
                            {shippingDetails?.lastName}
                          </h3>
                          <address dir={langDir}>
                            {shippingDetails?.address}, <br /> pin -{" "}
                            {shippingDetails?.postCode}
                          </address>
                          <p dir={langDir}>
                            <span translate="no">{t("phone_number")}{" "}</span>
                            <span className="!text-red-500" dir={langDir}>
                              {shippingDetails?.phone}
                            </span>
                          </p>
                        </div>
                        <div className="delivery-address-col deliveryAddress">
                          <h2 dir={langDir}>{t("billing_address")}</h2>
                          <h3 dir={langDir}>
                            {billingDetails?.firstName}{" "}
                            {billingDetails?.lastName}
                          </h3>
                          <address dir={langDir}>
                            {billingDetails?.address}, <br /> pin -{" "}
                            {billingDetails?.postCode}
                          </address>
                          <p dir={langDir}>
                            {t("phone_number")}{" "}
                            <span className="!text-red-500" dir={langDir}>
                              {billingDetails?.phone}
                            </span>
                          </p>
                        </div>
                        {/* <div className='delivery-address-col yourRewards'>
                        <h2>Your Rewards</h2>
                      </div> */}
                        <div className="delivery-address-col moreActions">
                          <h2 dir={langDir} translate="no">{t("more_actions")}</h2>
                          <figure className="downloadInvoice">
                            <figcaption>
                              <Button className="downloadInvoice-btn theme-primary-btn">
                                <LiaFileInvoiceSolid /> Download Invoice
                              </Button>
                            </figcaption>
                          </figure>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {orderDetails?.orderShippingDetail && orderDetails?.orderProductType != 'SERVICE' ? (
                  <div className="my-order-item">
                    <div className="my-order-card">
                      <div className="sm:grid sm:grid-cols-3 w-full gap-2 mb-2">
                        <div className="sm:flex gap-2">
                          <h3 className="!font-bold" translate="no">{t("shipping_mode")}:</h3>
                          <span>{orderDetails?.orderShippingDetail?.orderShippingType}</span>
                        </div>
                        <div className="sm:flex gap-2">
                          <h3 className="!font-bold" translate="no">{t("delivery_charge")}:</h3>
                          <span>{currency.symbol}{orderDetails?.orderShippingDetail?.shippingCharge}</span>
                        </div>
                      </div>
                      {orderDetails?.orderShippingDetail?.orderShippingType == "PICKUP" ? (
                        <div className="sm:grid sm:grid-cols-3 w-full gap-2">
                          <div className="sm:flex gap-2">
                            <h3 className="!font-bold" translate="no">{t("shipping_date")}:</h3>
                            <span>{convertDate(orderDetails?.orderShippingDetail?.shippingDate)}</span>
                          </div>
                          <div className="sm:flex gap-2">
                            <h3 className="!font-bold" translate="no">{t("from_time")}:</h3>
                            <span>{convertTime(orderDetails?.orderShippingDetail?.fromTime)}</span>
                          </div>
                          <div className="sm:flex gap-2">
                            <h3 className="!font-bold" translate="no">{t("to_time")}:</h3>
                            <span>{convertTime(orderDetails?.orderShippingDetail?.toTime)}</span>
                          </div>
                        </div>
                      ) : null}
                      {orderDetails?.orderShippingDetail?.receipt ? (
                        <div className="sm:grid sm:grid-cols-3 w-full gap-2 mt-2">
                          <Link
                            className="text-red-500"
                            href={orderDetails?.orderShippingDetail?.receipt}
                            target="_blank"
                            translate="no"
                          >
                            {t("download_receipt")}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {orderByIdQuery.isLoading ? (
                  <Skeleton className="h-44" />
                ) : (
                  <div className="my-order-item">
                    <div className="my-order-card">
                      <div className="my-order-box">
                        <Link
                          href={`/trending/${orderDetails?.orderProduct_product?.id}`}
                        >
                          {orderDetails?.orderProductType == 'SERVICE' ? (
                            <figure>
                              <div className="image-container rounded border border-gray-300">
                                <Image
                                  src={PlaceholderImage}
                                  alt="preview-product"
                                  width={120}
                                  height={120}
                                  placeholder="blur"
                                  blurDataURL="/images/product-placeholder.png"
                                />
                              </div>
                              <figcaption>
                                {/* <h3>
                                  {
                                    orderDetails.orderProduct_productPrice
                                      ?.productPrice_product?.productName
                                  }
                                </h3>
                                <p className="mt-1">
                                  Seller:{" "}
                                  {
                                    orderDetails?.orderProduct_productPrice
                                      ?.adminDetail?.firstName
                                  }{" "}
                                  {
                                    orderDetails?.orderProduct_productPrice
                                      ?.adminDetail?.lastName
                                  }
                                </p>
                                <h4 className="mt-1">
                                  {currency.symbol}
                                  {orderDetails?.orderProduct_productPrice
                                    ?.offerPrice
                                    ? Number(
                                      orderDetails?.orderProduct_productPrice
                                        ?.offerPrice *
                                      orderDetails?.orderQuantity,
                                    )
                                    : 0}
                                </h4>
                                <p className="text-gray-500" translate="no">
                                  {t("quantity")} x {orderDetails?.orderQuantity || 0}
                                </p> */}
                              </figcaption>
                            </figure>
                          ) : (
                            <figure>
                              <div className="image-container rounded border border-gray-300">
                                <Image
                                  src={
                                    orderDetails?.orderProduct_productPrice
                                      ?.productPrice_product?.productImages?.[0]
                                      ?.image || PlaceholderImage
                                  }
                                  alt="preview-product"
                                  width={120}
                                  height={120}
                                  placeholder="blur"
                                  blurDataURL="/images/product-placeholder.png"
                                />
                              </div>
                              <figcaption>
                                <h3>
                                  {
                                    orderDetails.orderProduct_productPrice
                                      ?.productPrice_product?.productName
                                  }
                                </h3>
                                <p className="mt-1">
                                  Seller:{" "}
                                  {
                                    orderDetails?.orderProduct_productPrice
                                      ?.adminDetail?.firstName
                                  }{" "}
                                  {
                                    orderDetails?.orderProduct_productPrice
                                      ?.adminDetail?.lastName
                                  }
                                </p>
                                <h4 className="mt-1">
                                  {currency.symbol}
                                  {orderDetails?.orderProduct_productPrice
                                    ?.offerPrice
                                    ? Number(
                                      orderDetails?.orderProduct_productPrice
                                        ?.offerPrice *
                                      orderDetails?.orderQuantity,
                                    )
                                    : 0}
                                </h4>
                                <p className="text-gray-500" translate="no">
                                  {t("quantity")} x {orderDetails?.orderQuantity || 0}
                                </p>
                              </figcaption>
                            </figure>
                          )}
                        </Link>
                        <div className="center-div">
                          <div className="order-delivery-progess-s1">
                            <ul>
                              <li className="complted">
                                <div className="orderStatusText" dir={langDir} translate="no">
                                  {t("order_received")}
                                </div>
                                <div className="dot">
                                  <small></small>
                                </div>
                                <div className="orderDateText">
                                  {formatDate(orderDetails?.orderProductDate)}
                                </div>
                              </li>
                              <li
                                className={cn(
                                  orderDetails?.orderProductStatus ===
                                    "CANCELLED" ||
                                    orderDetails?.orderProductStatus ===
                                    "DELIVERED" ||
                                    orderDetails?.orderProductStatus ===
                                    "OFD" ||
                                    orderDetails?.orderProductStatus ===
                                    "SHIPPED"
                                    ? "complted"
                                    : orderDetails?.orderProductStatus ===
                                      "CONFIRMED"
                                      ? "current"
                                      : "",
                                )}
                              >
                                <div className="orderStatusText" dir={langDir} translate="no">
                                  {t("order_confirmed")}
                                </div>
                                <div className="dot">
                                  <small></small>
                                </div>
                                <div className="orderDateText">
                                  {formatDate(orderDetails?.orderProductDate)}
                                </div>
                              </li>
                              <li
                                className={cn(
                                  orderDetails?.orderProductStatus ===
                                    "CANCELLED" ||
                                    orderDetails?.orderProductStatus ===
                                    "DELIVERED" ||
                                    orderDetails?.orderProductStatus === "OFD"
                                    ? "complted"
                                    : orderDetails?.orderProductStatus ===
                                      "SHIPPED"
                                      ? "current"
                                      : "",
                                )}
                              >
                                <div className="orderStatusText" dir={langDir} translate="no">{t("shipped")}</div>
                                <div className="dot">
                                  <small></small>
                                </div>
                                <div className="orderDateText">
                                  {orderDetails?.orderProductStatus ===
                                    "SHIPPED"
                                    ? formatDate(orderDetails?.updatedAt)
                                    : "-"}
                                </div>
                              </li>
                              <li
                                className={cn(
                                  orderDetails?.orderProductStatus ===
                                    "CANCELLED" ||
                                    orderDetails?.orderProductStatus ===
                                    "DELIVERED"
                                    ? "complted"
                                    : orderDetails?.orderProductStatus === "OFD"
                                      ? "current"
                                      : "",
                                )}
                              >
                                <div className="orderStatusText" dir={langDir} translate="no">
                                  {t("out_for_delivery")}
                                </div>
                                <div className="dot">
                                  <small></small>
                                </div>
                                <div className="orderDateText">
                                  {orderDetails?.orderProductStatus === "OFD"
                                    ? formatDate(orderDetails?.updatedAt)
                                    : "-"}
                                </div>
                              </li>
                              <li
                                className={cn(
                                  orderDetails?.orderProductStatus ===
                                    "CANCELLED"
                                    ? "complted"
                                    : orderDetails?.orderProductStatus ===
                                      "DELIVERED"
                                      ? "complted"
                                      : "",
                                )}
                              >
                                <div
                                  className={cn(
                                    orderDetails?.orderProductStatus ===
                                      "CANCELLED"
                                      ? "orderStatusCancelledText"
                                      : "orderStatusText",
                                  )}
                                  translate="no"
                                >
                                  {orderDetails?.orderProductStatus ===
                                    "CANCELLED"
                                    ? t("cancelled")
                                    : t("delivered")}
                                </div>
                                <div className="dot">
                                  <small
                                    className={cn(
                                      orderDetails?.orderProductStatus ===
                                        "CANCELLED"
                                        ? "!bg-red-500"
                                        : "",
                                    )}
                                  ></small>
                                </div>
                                <div className="orderDateText">
                                  {orderDetails?.orderProductStatus ===
                                    "CANCELLED" ||
                                    orderDetails?.orderProductStatus ===
                                    "DELIVERED"
                                    ? formatDate(orderDetails?.updatedAt)
                                    : "-"}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="right-info">
                          <h4 className="mb-2" dir={langDir} translate="no">
                            {orderDetails?.orderProductStatus ===
                              "CONFIRMED" ? (
                              <>
                                <BiCircle color="green" />
                                {t("placed_on")}{" "}
                                {orderDetails?.orderProductDate
                                  ? formattedDate(orderDetails.orderProductDate)
                                  : ""}
                              </>
                            ) : null}

                            {orderDetails?.orderProductStatus === "SHIPPED" ? (
                              <>
                                <BiCircle color="green" />
                                {t("shipped_on")}{" "}
                                {orderDetails?.updatedAt
                                  ? formattedDate(orderDetails.updatedAt)
                                  : ""}
                              </>
                            ) : null}

                            {orderDetails?.orderProductStatus === "OFD" ? (
                              <>
                                <BiCircle color="green" /> {t("out_for_delivery")}{" "}
                                {orderDetails?.updatedAt
                                  ? formattedDate(orderDetails.updatedAt)
                                  : ""}
                              </>
                            ) : null}

                            {orderDetails?.orderProductStatus ===
                              "DELIVERED" ? (
                              <>
                                <BiSolidCircle color="green" /> {t("delivered_on")}{" "}
                                {orderDetails?.updatedAt
                                  ? formattedDate(orderDetails.updatedAt)
                                  : ""}
                              </>
                            ) : null}

                            {orderDetails?.orderProductStatus ===
                              "CANCELLED" ? (
                              <>
                                <BiSolidCircle color="red" /> {t("cancelled_on")}{" "}
                                {orderDetails?.updatedAt
                                  ? formattedDate(orderDetails.updatedAt)
                                  : ""}
                              </>
                            ) : null}
                          </h4>

                          {orderDetails?.orderProductStatus === "DELIVERED" ? (
                            <Link
                              href={`/trending/${orderDetails?.productId}?type=reviews`}
                              className="ratingLink"
                              dir={langDir}
                              translate="no"
                            >
                              <PiStarFill />
                              {t("rate_n_review_product")}
                            </Link>
                          ) : null}
                          <Button variant="ghost" className="ratingLink mt-0" dir={langDir} translate="no">
                            <MdHelpCenter />
                            {t("need_help")}
                          </Button>

                          {orderDetails?.orderProductStatus === "DELIVERED" ? (
                            <Link
                              href={
                                orderDetails?.orderProduct_productPrice
                                  ?.adminDetail?.tradeRole === "COMPANY"
                                  ? `/company-profile-details?userId=${orderDetails?.orderProduct_productPrice?.adminDetail?.id}&productPriceId=${orderDetails?.orderProduct_productPrice?.id}&productId=${orderDetails?.orderProduct_productPrice?.productId}&type=ratings`
                                  : orderDetails?.orderProduct_productPrice
                                    ?.adminDetail?.tradeRole ===
                                    "FREELANCER"
                                    ? `/freelancer-profile-details?userId=${orderDetails?.orderProduct_productPrice?.adminDetail?.id}&productPriceId=${orderDetails?.orderProduct_productPrice?.id}&productId=${orderDetails?.orderProduct_productPrice?.productId}&type=ratings`
                                    : "#"
                              }
                              className="ratingLink"
                              dir={langDir}
                              translate="no"
                            >
                              <PiStarFill />
                              {t("rate_n_review_seller")}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {orderByIdQuery.isLoading ? (
                  <Skeleton className="h-52" />
                ) : null}

                {otherOrderDetails?.map((item: any) => (
                  <OtherItemCard
                    key={item?.id}
                    id={item?.id}
                    orderProductType={item?.orderProductType}
                    productName={
                      item.orderProduct_productPrice?.productPrice_product
                        ?.productName
                    }
                    offerPrice={item?.purchasePrice}
                    orderQuantity={item?.orderQuantity}
                    productImages={
                      item.orderProduct_productPrice?.productPrice_product
                        ?.productImages
                    }
                    sellerName={`${item?.orderProduct_productPrice?.adminDetail?.firstName} ${item?.orderProduct_productPrice?.adminDetail?.lastName}`}
                    orderNo={orderDetails?.orderProduct_order?.orderNo}
                    orderProductDate={item?.orderProductDate}
                    orderProductStatus={item?.orderProductStatus}
                    updatedAt={item?.updatedAt}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* <Dialog open={isReviewModalOpen} onOpenChange={handleToggleReviewModal}>
          <DialogContent>
            <ReviewForm
              onClose={() => {
                setReviewId(undefined);
                handleToggleReviewModal();
              }}
              reviewId={reviewId}
            />
          </DialogContent>
        </Dialog> */}
      </div>
      <Footer />
    </>
  );
};

export default MyOrderDetailsPage;
