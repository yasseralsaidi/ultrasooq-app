"use client";
import React, { useEffect, useState } from "react";
import {
  useCartListByDevice,
  useCartListByUserId,
} from "@/apis/queries/cart.queries";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { getOrCreateDeviceId } from "@/utils/helper";
import PaymentForm from "@/components/modules/orders/PaymentForm";
import { initialOrderState, useOrderStore } from "@/lib/orderStore";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateEMIPayment,
  useCreateOrder,
  useCreateOrderUnAuth,
  useCreatePaymentIntent,
  useCreatePaymentLink,
} from "@/apis/queries/orders.queries";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoaderWithMessage from "@/components/shared/LoaderWithMessage";

// Load Stripe with your public key
const stripePromise = loadStripe(
  "pk_test_51QuptGPQ2VnoEyMPay2u4FyltporIQfMh9hWcp2EEresPjx07AuT4lFLuvnNrvO7ksqtaepmRQHfYs4FLia8lIV500i83tXYMR",
);

const CompleteOrderPage = () => {
  const t = useTranslations();
  const { langDir, currency } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const hasAccessToken = !!getCookie(PUREMOON_TOKEN_KEY);
  const deviceId = getOrCreateDeviceId() || "";
  const orderStore = useOrderStore();

  const createOrder = useCreateOrder();
  const createOrderUnAuth = useCreateOrderUnAuth();
  const createPaymentIntent = useCreatePaymentIntent();
  const createPaymentLink = useCreatePaymentLink();
  const createEMIPayment = useCreateEMIPayment();
  const [paymentType, setPaymentType] = useState<string>("DIRECT");
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [isRedirectingToPaymob, setIsRedirectingToPaymob] = useState<boolean>(false);
  const [paymentLink, setPaymentLink] = useState<string>();
  const [emiPeriod, setEmiPeriod] = useState<number>(6);
  const [emiAmount, setEmiAmount] = useState<number>(0);

  // useEffect(() => {
  //   if (paymentType == "EMI") {
  //     setEmiAmount(Number((orderStore.total / emiPeriod).toFixed(2)));
  //   }
  // }, [paymentType, emiPeriod]);

  const referenceOrderId = (orderId: number) => {
    const date = new Date();

    return [
      orderId,
      date.getHours() < 10 ? `0${date.getHours()}` : String(date.getHours()),
      date.getMinutes() < 10
        ? `0${date.getMinutes()}`
        : String(date.getMinutes()),
      date.getDate() < 10 ? `0${date.getDate()}` : String(date.getDate()),
      date.getMonth() < 10 ? `0${date.getMonth()}` : String(date.getMonth()),
      date.getFullYear() < 10
        ? `0${date.getFullYear()}`
        : String(date.getFullYear()),
    ].join("-");
  };

  const copyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({
        title: t("copied"),
        description: '',
        variant: "success",
      });
    }
  };

  const handleCreateOrder = async () => {
    if (hasAccessToken) {
      if (orderStore.orders) {
        if (!orderStore.orders.cartIds?.length && !orderStore.orders.serviceCartIds?.length) {
          toast({
            title: t("order_cant_be_placed"),
            description: t("order_placed_retry_info"),
            variant: "danger",
          });
          return;
        }

        if (paymentType == "ADVANCE") {
          if (!advanceAmount) {
            toast({
              title: t("order_cant_be_placed"),
              description: t("advance_payment_is_required"),
              variant: "danger",
            });
            return;
          }

          if (advanceAmount > orderStore.total) {
            toast({
              title: t("order_cant_be_placed"),
              description: t("advance_payment_must_be_less_than_total_amount"),
              variant: "danger",
            });
            return;
          }
        }

        let data: {[key: string]: any} = orderStore.orders;
        data.paymentType = paymentType;
        if (paymentType == "ADVANCE") {
          data.advanceAmount = advanceAmount;
          data.dueAmount = orderStore.total - advanceAmount;
        } else if (paymentType == "EMI") {
          // data.emiInstallmentCount = emiPeriod;
          // data.emiInstallmentAmount = emiAmount;
          // data.emiInstallmentAmountCents = emiAmount * 1000;
        }

        const response = await createOrder.mutateAsync(orderStore.orders);
        if (response?.status) {
          if (paymentType == "PAYMENTLINK") {
            await handleCreatePaymentLink(response?.data?.id);
          } else if (paymentType == "EMI") {
            // await handleCreateEmiPayment(response?.data?.id);
          } else {
            await handleCreatePaymentIntent(response?.data?.id);
          }
        } else {
          toast({
            title: t("something_went_wrong"),
            description: response.message,
            variant: "danger",
          });
        }
      }
    } else {
    }
  };

  const handleCreatePaymentIntent = async (orderId: number) => {
    let data: { [key: string]: any } = {
      amount: paymentType == "ADVANCE" ? advanceAmount * 1000 : orderStore.total * 1000,
      billing_data: {
        first_name: orderStore.orders.firstName,
        last_name: orderStore.orders.lastName,
        email: orderStore.orders.email,
        phone_number: orderStore.orders.phone,
        apartment: orderStore.orders.billingAddress,
        building: 'NA',
        street: 'NA',
        floor: 'NA',
        city: orderStore.orders.billingCity,
        state: orderStore.orders.billingProvince,
        country: orderStore.orders.billingCountry,
      },
      extras: {
        orderId: orderId,
        paymentType: paymentType,
      },
      special_reference: referenceOrderId(orderId)
    };

    const response = await createPaymentIntent.mutateAsync(data);

    if (response?.status) {
      setIsRedirectingToPaymob(true);
      window.location.assign(
        `${process.env.NEXT_PUBLIC_PAYMOB_PAYMENT_URL}?publicKey=${process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY}&clientSecret=${response.data.client_secret}`,
      );
    } else {
      toast({
        title: t("something_went_wrong"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  const handleCreatePaymentLink = async (orderId: number) => {
    let data = {
      amountCents: orderStore.total * 1000,
      referenceId: referenceOrderId(orderId),
      email: orderStore.orders.email,
      isLive: false,
      fullName: `${orderStore.orders.firstName} ${orderStore.orders.lastName}`,
      description: `orderId=${orderId}`
    }

    const response = await createPaymentLink.mutateAsync(data);

    if (response?.success) {
      setPaymentLink(response?.data?.client_url);
      orderStore.resetOrders();
      orderStore.setTotal(0);
    } else {
      toast({
        title: t("something_went_wrong"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  const handleCreateEmiPayment = async (orderId: number) => {
    let data: { [key: string]: any } = {
      amount: emiAmount * 1000,
      billing_data: {
        first_name: orderStore.orders.firstName,
        last_name: orderStore.orders.lastName,
        email: orderStore.orders.email,
        phone_number: orderStore.orders.phone,
        apartment: orderStore.orders.billingAddress,
        building: 'NA',
        street: 'NA',
        floor: 'NA',
        city: orderStore.orders.billingCity,
        state: orderStore.orders.billingProvince,
        country: orderStore.orders.billingCountry,
      },
      extras: {
        orderId: orderId,
        paymentType: paymentType,
      },
      special_reference: referenceOrderId(orderId)
    };

    const response = await createEMIPayment.mutateAsync(data);

    if (response?.status) {
      setIsRedirectingToPaymob(true);
      window.location.assign(
        `${process.env.NEXT_PUBLIC_PAYMOB_PAYMENT_URL}?publicKey=${process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY}&clientSecret=${response.data.client_secret}`,
      );
    } else {
      toast({
        title: t("something_went_wrong"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  return (
    <div className="cart-page">
      <div className="container m-auto px-3">
        <div className="headerPart" dir={langDir}>
          <div className="lediv">
            <h3 translate="no">{t("make_payment")}</h3>
          </div>
        </div>
        <div className="cart-page-wrapper">
          <div className="cart-page-left">
            <div className="flex items-center justify-start gap-2 sm:grid">
              <Label translate="no">{t("direct_payment")}</Label>
              <Switch
                checked={paymentType == "DIRECT"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPaymentType("DIRECT");
                    setAdvanceAmount(0);
                  }
                }}
                className="m-0 data-[state=checked]:!bg-dark-orange"
              />
            </div>
            <div className="mt-3 flex items-center justify-start gap-2 sm:grid">
              <Label translate="no">{t("advance_payment")}</Label>
              <Switch
                checked={paymentType == "ADVANCE"}
                onCheckedChange={(checked) => {
                  if (checked) setPaymentType("ADVANCE");
                }}
                className="m-0 data-[state=checked]:!bg-dark-orange"
              />
            </div>
            {paymentType == "ADVANCE" ? (
              <div className="mt-3 sm:grid sm:grid-cols-3">
                <Input
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                />
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-start gap-2 sm:grid">
              <Label translate="no">{t("pay_it_for_me")}</Label>
              <Switch
                checked={paymentType == "PAYMENTLINK"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPaymentType("PAYMENTLINK");
                    setAdvanceAmount(0);
                  }
                }}
                className="m-0 data-[state=checked]:!bg-dark-orange"
              />
              {paymentLink ? (
                <>
                  <div className="sm:grid sm:grid-cols-3">
                    <Button type="button" onClick={copyPaymentLink} translate="no">
                      {t("copy_payment_link")}
                    </Button>
                  </div>
                  <div className="sm:grid sm:grid-cols-1">
                    <span translate="no">{t("copy_payment_link_instruction")}</span>
                  </div>
                </>
              ) : null}
            </div>
            {/* <div className="mt-3 flex items-center justify-start gap-2 sm:grid">
              <Label translate="no">{t("installments")}</Label>
              <Switch
                checked={paymentType == "EMI"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPaymentType("EMI");
                    setAdvanceAmount(0);
                  }
                }}
                className="m-0 data-[state=checked]:!bg-dark-orange"
              />
              {paymentType == "EMI" ? (
                <>
                  <div className="sm:grid sm:grid-cols-3">
                    <Label dir={langDir} translate="no">{t("emi_period")}{" "}({t("months")})</Label>
                  </div>
                  <div className="sm:grid sm:grid-cols-3">
                    <select
                      value={emiPeriod}
                      onChange={(e) => setEmiPeriod(Number(e.target.value))}
                      style={{ border: "1px solid" }}
                    >
                      <option value="6">6</option>
                      <option value="12">12</option>
                      <option value="18">18</option>
                      <option value="24">24</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div> */}
          </div>
          <div className="cart-page-right">
            <div className="card-item priceDetails">
              <div className="card-inner-headerPart" dir={langDir}>
                <div className="lediv">
                  <h3 dir={langDir} translate="no">{t("price_details")}</h3>
                </div>
              </div>
              <div className="priceDetails-body">
                <ul>
                  <li>
                    <p dir={langDir} translate="no">{t("subtotal")}</p>
                    <h5>
                      {currency.symbol}
                      {orderStore.total || 0}
                    </h5>
                  </li>
                  {advanceAmount > 0 ? (
                    <>
                      <li>
                        <p dir={langDir} translate="no">{t("advance_payment")}</p>
                        <h5>
                          {currency.symbol}
                          {advanceAmount || 0}
                        </h5>
                      </li>
                      <li>
                        <p dir={langDir} translate="no">{t("shipping")}</p>
                        <h5 dir={langDir} translate="no">{t("free")}</h5>
                      </li>
                    </>
                  ) : null}
                </ul>
              </div>
              <div className="priceDetails-footer">
                <h4 dir={langDir} translate="no">{t("total_amount")}</h4>
                <h4 className="amount-value">
                  {currency.symbol}
                  {advanceAmount > 0
                    ? advanceAmount || 0
                    : orderStore.total || 0}
                </h4>
                <br />
                {advanceAmount > 0 ? (
                  <>
                    <h4 translate="no">{t("due_balance")}</h4>
                    <h4 className="amount-value">
                      {currency.symbol}
                      {(orderStore.total - advanceAmount).toFixed(2)}
                    </h4>
                  </>
                ) : null}
                {paymentType == "EMI" ? (
                  <>
                    <h4 translate="no">{t("emi_amount")}</h4>
                    <h4 className="amount-value">
                      {currency.symbol}
                      {emiAmount}
                    </h4>
                  </>
                ) : null}
              </div>
            </div>
            <div className="order-action-btn">
              <Button
                onClick={handleCreateOrder}
                disabled={createOrder?.isPending || 
                  createPaymentIntent?.isPending || 
                  createEMIPayment?.isPending || 
                  isRedirectingToPaymob
                }
                className="theme-primary-btn order-btn"
                translate="no"
              >
                {createOrder?.isPending ? (
                  <LoaderWithMessage message={t("placing_order")} />
                ) : createPaymentIntent?.isPending || 
                  createPaymentLink?.isPending || 
                  createEMIPayment?.isPending || 
                  isRedirectingToPaymob ? (
                  <LoaderWithMessage message={t("initiating_payment")} />
                ) : (
                  t("place_order")
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteOrderPage;
