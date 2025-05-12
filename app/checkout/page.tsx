"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/modules/checkout/ProductCard";
import {
  useCartListByDevice,
  useCartListByUserId,
  useDeleteCartItem,
  useDeleteServiceFromCart,
  useUpdateCartByDevice,
  useUpdateCartWithLogin,
} from "@/apis/queries/cart.queries";
import AddressCard from "@/components/modules/checkout/AddressCard";
import AddressForm from "@/components/modules/checkout/AddressForm";
// import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  useAllUserAddress,
  useDeleteAddress,
} from "@/apis/queries/address.queries";
import { useRouter } from "next/navigation";
import { CartItem } from "@/utils/types/cart.types";
import { AddressItem } from "@/utils/types/address.types";
import { useClickOutside } from "use-events";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { convertDateTimeToUTC, getOrCreateDeviceId } from "@/utils/helper";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMe } from "@/apis/queries/user.queries";
import { OrderDetails } from "@/utils/types/orders.types";
import Image from "next/image";
import { useOrderStore } from "@/lib/orderStore";
import { Input } from "@/components/ui/input";
import GuestAddressCard from "@/components/modules/checkout/GuestAddressCard";
import validator from "validator";
import GuestAddressForm from "@/components/modules/checkout/GuestAddressForm";
import AddIcon from "@/public/images/addbtn.svg";
import { useAddToWishList } from "@/apis/queries/wishlist.queries";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { usePreOrderCalculation } from "@/apis/queries/orders.queries";
import LoaderWithMessage from "@/components/shared/LoaderWithMessage";
import { IoCloseSharp } from "react-icons/io5";
import Select from "react-select";
import Shipping from "@/components/modules/checkout/Shipping";
import ServiceCard from "@/components/modules/checkout/ServiceCard";

const CheckoutPage = () => {
  const t = useTranslations();
  const { user, langDir, currency } = useAuth();
  const router = useRouter();
  const wrapperRef = useRef(null);
  const { toast } = useToast();
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >();
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<OrderDetails>();
  const [addressType, setAddressType] = useState<"shipping" | "billing">();
  const [guestShippingAddress, setGuestShippingAddress] = useState<
    | {
        firstName: string;
        lastName: string;
        cc: string;
        phoneNumber: string;
        address: string;
        town: string;
        city: string;
        cityId: string;
        state: string;
        stateId: string;
        country: string;
        countryId: string;
        postCode: string;
      }
    | undefined
  >();
  const [guestBillingAddress, setGuestBillingAddress] = useState<
    | {
        firstName: string;
        lastName: string;
        cc: string;
        phoneNumber: string;
        address: string;
        town: string;
        city: string;
        cityId: string;
        state: string;
        stateId: string;
        country: string;
        countryId: string;
        postCode: string;
      }
    | undefined
  >();
  const [guestEmail, setGuestEmail] = useState("");
  const [itemsTotal, setItemsTotal] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [sellerIds, setSellerIds] = useState<number[]>([]);
  const [shippingInfo, setShippingInfo] = useState<any[]>([]);
  const [shippingErrors, setShippingErrors] = useState<any[]>([]);
  const [shippingCharge, setShippingCharge] = useState<number>(0);

  const [selectedCartId, setSelectedCartId] = useState<number>();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const handleConfirmDialog = () =>
    setIsConfirmDialogOpen(!isConfirmDialogOpen);
  const confirmDialogRef = useRef(null);
  const [isClickedOutsideConfirmDialog] = useClickOutside(
    [confirmDialogRef],
    (event) => {
      onCancelRemove();
    },
  );

  const [selectedSellerId, setSelectedSellerId] = useState<number>();
  const [selectedShippingType, setSelectedShippingType] = useState<string>();
  const [fromCityId, setFromCityId] = useState<number>();
  const [toCityId, setToCityId] = useState<number>();
  const [isShippingModalOpen, setIsShippingModalOpen] =
    useState<boolean>(false);
  const handleShippingModal = () =>
    setIsShippingModalOpen(!isShippingModalOpen);
  const shippingModalRef = useRef(null);

  const deviceId = getOrCreateDeviceId() || "";
  const accessToken = getCookie(PUREMOON_TOKEN_KEY);

  const orderStore = useOrderStore();
  const preOrderCalculation = usePreOrderCalculation();

  const [isClickedOutside] = useClickOutside([wrapperRef], (event) => {});

  const me = useMe(haveAccessToken);
  const cartListByDeviceQuery = useCartListByDevice(
    {
      page: 1,
      limit: 100,
      deviceId,
    },
    !haveAccessToken,
  );
  const cartListByUser = useCartListByUserId(
    {
      page: 1,
      limit: 100,
    },
    haveAccessToken,
  );
  const updateCartWithLogin = useUpdateCartWithLogin();
  const updateCartByDevice = useUpdateCartByDevice();
  const deleteCartItem = useDeleteCartItem();
  const deleteServiceFromCart = useDeleteServiceFromCart();
  const addToWishlist = useAddToWishList();
  const allUserAddressQuery = useAllUserAddress(
    {
      page: 1,
      limit: 10,
    },
    haveAccessToken,
  );
  const delteAddress = useDeleteAddress();

  const handleToggleAddModal = () => setIsAddModalOpen(!isAddModalOpen);

  const memoizedCartList = useMemo(() => {
    if (cartListByUser.data?.data) {
      return cartListByUser.data?.data || [];
    } else if (cartListByDeviceQuery.data?.data) {
      return cartListByDeviceQuery.data?.data || [];
    }
    return [];
  }, [cartListByUser.data?.data, cartListByDeviceQuery.data?.data]);

  const calculateDiscountedPrice = (
    offerPrice: string | number,
    discount: number,
    discountType?: string,
  ) => {
    const price = offerPrice ? Number(offerPrice) : 0;
    if (discountType == "PERCENTAGE") {
      return Number((price - (price * discount) / 100).toFixed(2));
    }
    return Number((price - discount).toFixed(2));
  };

  const calculateTotalAmount = () => {
    if (cartListByUser.data?.data?.length) {
      setItemsTotal(
        cartListByUser.data?.data?.reduce(
          (
            acc: number,
            curr: {
              cartType: "DEFAULT" | "SERVICE";
              productPriceDetails: {
                offerPrice: string;
                consumerDiscount?: number;
                consumerDiscountType?: string;
                vendorDiscount?: number;
                vendorDiscountType?: string;
              };
              quantity: number;
              productId?: number;
              serviceId?: number;
              cartServiceFeatures: any[];
              service: {
                eachCustomerTime: number;
              }
            },
          ) => {
            // @ts-ignore
            if (curr.cartType == "DEFAULT" && !invalidProducts.includes(curr.productId) && !notAvailableProducts.includes(curr.productId)) {
              let discount = curr?.productPriceDetails?.consumerDiscount;
              let discountType = curr?.productPriceDetails?.consumerDiscountType;
              if (user?.tradeRole && user.tradeRole != "BUYER") {
                discount = curr?.productPriceDetails?.vendorDiscount;
                discountType = curr?.productPriceDetails?.vendorDiscountType;
              }
              let calculatedDiscount = calculateDiscountedPrice(
                curr.productPriceDetails?.offerPrice ?? 0,
                discount || 0,
                discountType,
              );
  
              return Number(
                (acc + calculatedDiscount * curr.quantity).toFixed(2),
              );
            }

            if (!curr.cartServiceFeatures?.length) return acc;

            let amount = 0;
            for (let feature of curr.cartServiceFeatures) {
              if (feature.serviceFeature?.serviceCostType == "FLAT") {
                amount += Number(feature.serviceFeature?.serviceCost || '') * (feature.quantity || 1);
              } else {
                amount += Number(feature?.serviceFeature?.serviceCost || '') * (feature.quantity || 1) * curr.service.eachCustomerTime;
              }
            }

            return Number((acc + amount).toFixed(2));
          },
          0,
        ),
      );
    } else if (cartListByDeviceQuery.data?.data?.length) {
      setItemsTotal(
        cartListByDeviceQuery.data?.data?.reduce(
          (
            acc: number,
            curr: {
              cartType: "DEFAULT" | "SERVICE";
              productPriceDetails: {
                offerPrice: string;
              };
              quantity: number;
              productId?: number;
              serviceId?: number;
              cartServiceFeatures: any[];
              service: {
                eachCustomerTime: number
              }
            },
          ) => {
            // @ts-ignore
            if (curr.cartType == "DEFAULT"  && !invalidProducts.includes(curr.productId) && !notAvailableProducts.includes(curr.productId)) {
              return Number(
                (
                  acc +
                  +(curr.productPriceDetails?.offerPrice ?? 0) * curr.quantity
                ).toFixed(2),
              );
            }

            if (!curr.cartServiceFeatures?.length) return acc;

            let amount = 0;
            for (let feature of curr.cartServiceFeatures) {
              if (feature.serviceFeature?.serviceCostType == "FLAT") {
                amount += Number(feature.serviceFeature?.serviceCost || '') * (feature.quantity || 1);
              } else {
                amount += Number(feature?.serviceFeature?.serviceCost || '') * (feature.quantity || 1) * curr.service.eachCustomerTime;
              }
            }
  
            return Number((acc + amount).toFixed(2));
          },
          0,
        ),
      );
    }
  };

  const memoziedAddressList = useMemo(() => {
    return allUserAddressQuery.data?.data || [];
  }, [allUserAddressQuery.data?.data]);

  const shippingOptions = () => {
    return [
      { value: "PICKUP", label: "Consumer Pickup" },
      { value: "SELLERDROP", label: "Delivery By Seller" },
      { value: "THIRDPARTY", label: "Third Party" },
      { value: "PLATFORM", label: "Third Party (Within Platform)" },
    ];
  };

  const handleAddToCart = async (
    quantity: number,
    actionType: "add" | "remove",
    productPriceId: number,
    productVariant?: any,
  ) => {
    if (haveAccessToken) {
      const response = await updateCartWithLogin.mutateAsync({
        productPriceId,
        quantity,
        productVariant,
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
    } else {
      const response = await updateCartByDevice.mutateAsync({
        productPriceId,
        quantity,
        deviceId,
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
    }
  };

  const handleRemoveItemFromCart = async (cartId: number) => {
    const response = await deleteCartItem.mutateAsync({ cartId });
    if (response.status) {
      toast({
        title: t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
    }
  };

  const onConfirmRemove = () => {
    if (selectedCartId) handleRemoveItemFromCart(selectedCartId);
    setIsConfirmDialogOpen(false);
    setSelectedCartId(undefined);
  };

  const onCancelRemove = () => {
    setIsConfirmDialogOpen(false);
    setSelectedCartId(undefined);
  };

  const handleRemoveServiceFromCart = async (cartId: number, serviceFeatureId: number) => {
    const cartItem = memoizedCartList.find((item: any) => item.id == cartId);
    let payload: any = { cartId };
    if (cartItem?.cartServiceFeatures?.length > 1) {
      payload.serviceFeatureId = serviceFeatureId;
    }
    const response = await deleteServiceFromCart.mutateAsync(payload);
    if (response.status) {
      toast({
        title: t("item_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: response.message || t("item_not_removed_from_cart"),
        description: response.message || t("check_your_cart_for_more_details"),
        variant: "danger",
      });
    }
  };

  const handleDeleteAddress = async (userAddressId: number) => {
    const response = await delteAddress.mutateAsync({ userAddressId });
    if (response.status) {
      toast({
        title: t("address_removed"),
        description: t("check_your_address_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: t("item_not_removed_from_cart"),
        description: t("check_your_cart_for_more_details"),
        variant: "danger",
      });
    }
  };

  const handleAddToWishlist = async (productId: number) => {
    const response = await addToWishlist.mutateAsync({ productId });
    if (response.status) {
      toast({
        title: t("item_added_to_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "success",
      });
    } else {
      toast({
        title: response.message || t("item_not_added_to_wishlist"),
        description: t("check_your_wishlist_for_more_details"),
        variant: "danger",
      });
    }
  };

  const handleOrderDetails = (
    item: AddressItem,
    addresszType: "shipping" | "billing",
  ) => {
    if (addresszType === "shipping") {
      setSelectedOrderDetails((prevState) => ({
        ...prevState,
        firstName: item.firstName || me.data?.data?.firstName,
        lastName: item.lastName || me.data?.data?.lastName,
        email: me.data?.data?.email,
        cc: item.cc,
        phone: item.phoneNumber,
        shippingAddress: item.address,
        // shippingTown: item.town,
        shippingCity: item.cityDetail?.name,
        shippingProvince: item.stateDetail?.name,
        shippingCountry: item.countryDetail?.name,
        shippingPostCode: item.postCode,
      }));
    } else if (addresszType === "billing") {
      setSelectedOrderDetails((prevState) => ({
        ...prevState,
        firstName: item.firstName || me.data?.data?.firstName,
        lastName: item.lastName || me.data?.data?.lastName,
        email: me.data?.data?.email,
        cc: item.cc,
        phone: item.phoneNumber,
        billingAddress: item.address,
        // billingTown: item.town,
        billingCity: item.cityDetail?.name,
        billingProvince: item.stateDetail?.name,
        billingCountry: item.countryDetail?.name,
        billingPostCode: item.postCode,
      }));
    }
  };

  // State for selected addresses
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<
    string | null
  >(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    string | null
  >(null);

  //  Set default selected address when addresses are loaded
  useEffect(() => {
    if (memoziedAddressList.length > 0) {
      setSelectedShippingAddressId(memoziedAddressList[0].id.toString());
      setSelectedBillingAddressId(memoziedAddressList[0].id.toString());

      // Call handleOrderDetails for both shipping and billing
      handleOrderDetails(memoziedAddressList[0], "shipping");
      handleOrderDetails(memoziedAddressList[0], "billing");
    }
  }, [memoziedAddressList]);

  const [invalidProducts, setInvalidProducts] = useState<number[]>([]);
  const [notAvailableProducts, setNotAvailableProducts] = useState<number[]>(
    [],
  );

  const calculateFees = async () => {
    const response = await preOrderCalculation.mutateAsync({
      cartIds: memoizedCartList.filter((item: any) => item.productId)?.map((item: any) => item.id),
      serviceCartIds: memoizedCartList.filter((item: any) => item.serviceId)?.map((item: any) => item.id),
      userAddressId: Number(selectedShippingAddressId),
    });

    setInvalidProducts(
      response?.invalidProducts?.map((productId: number) => productId) || [],
    );
    setNotAvailableProducts(
      response?.productCannotBuy?.map((item: any) => item.productId) || [],
    );

    let chargedFee = 0;
    if (response?.data?.length) {
      response.data.forEach((item: any) => {
        if (item.orderProductType != 'SERVICE') {
          chargedFee += Number(item?.breakdown?.customer?.chargedFee);
        }
      });
    }
    setFee(chargedFee);

    calculateTotalAmount();

    setTotalAmount(response?.totalCustomerPay || 0)
  };

  useEffect(() => {
    if (memoizedCartList.length) {
      let userIds = memoizedCartList.filter((item: any) => item.productPriceDetails)?.map((item: any) => {
        return item.productPriceDetails.adminId;
      }) || [];
      // @ts-ignore
      userIds = [...new Set(userIds)];

      setSellerIds(userIds);

      setShippingInfo(
        userIds.map((userId: number) => {
          const info = shippingInfo.find(
            (item: any) => item.sellerId == userId,
          );

          if (info) return info;

          return {
            sellerId: userId,
            shippingType: "PICKUP",
            info: {
              shippingDate: null,
              fromTime: null,
              toTime: null,
              shippingCharge: 0,
              serviceId: null,
            },
          };
        }),
      );

      setShippingErrors(
        userIds.map((userId: number) => {
          const data = shippingErrors.find(
            (item: any) => item.sellerId == userId,
          );

          if (data) return data;

          return {
            sellerId: userId,
            errors: {},
          };
        }),
      );

      if (selectedShippingAddressId) calculateFees();
    }
  }, [
    cartListByUser.data?.data,
    cartListByDeviceQuery?.data?.data,
    allUserAddressQuery?.data?.data,
    selectedBillingAddressId,
    selectedShippingAddressId,
  ]);

  useEffect(() => {
    calculateTotalAmount();
  }, [cartListByUser.data?.data, cartListByDeviceQuery?.data?.data, invalidProducts, notAvailableProducts]);

  useEffect(() => {
    setTotalAmount(prevAmount => (prevAmount || itemsTotal) + shippingCharge);
  }, [itemsTotal, shippingCharge]);

  useEffect(() => {
    let charge = 0;
    for (let info of shippingInfo) {
      charge += info.info?.shippingCharge || 0;
    }
    setShippingCharge(charge);
  }, [shippingInfo]);

  const validateShippingInfo = (): boolean => {
    let count = 0;
    let errors = shippingErrors;
    let i = 0;
    for (let info of shippingInfo) {
      errors[i].errors = {};

      if (info.shippingType == "PICKUP") {
        if (!info?.info?.shippingDate) {
          errors[i]["errors"]["shippingDate"] = "Shipping date is required";
        } else {
          let date = new Date();
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          if (
            new Date(info?.info?.shippingDate + " 00:00:00").getTime() <=
            date.getTime()
          ) {
            errors[i]["errors"]["shippingDate"] =
              "Shipping date must be greater than current date";
          }
        }

        if (!info?.info?.fromTime) {
          errors[i]["errors"]["fromTime"] = "From time is required";
        }

        if (!info?.info?.toTime) {
          errors[i]["errors"]["toTime"] = "To time is required";
        }

        if (
          info?.info?.fromTime &&
          info?.info?.toTime &&
          info?.info?.fromTime >= info?.info?.toTime
        ) {
          errors[i]["errors"]["fromTime"] =
            "From time must be less than to time";
        }

        count += Object.keys(errors[i]["errors"]).length > 0 ? 1 : 0;
      }

      if (
        info.shippingType == "SELLERDROP" ||
        info.shippingType == "PLATFORM"
      ) {
        if (!info?.info?.serviceId) {
          errors[i]["errors"]["serviceId"] = "Shipping service is required";
        }

        count += Object.keys(errors[i]["errors"]).length > 0 ? 1 : 0;
      }

      i++;
    }

    setShippingErrors([...errors]);

    return count == 0;
  };

  const prepareShippingInfo = () => {
    let data: any[] = [];
    let i = 0;
    for (let info of shippingInfo) {
      data[i] = {
        sellerId: info.sellerId,
        orderShippingType: info.shippingType,
        shippingDate: null,
        fromTime: null,
        toTime: null,
        shippingCharge: 0,
        serviceId: null,
      };

      if (info.shippingType == "PICKUP") {
        data[i].shippingDate = convertDateTimeToUTC(
          `${info.info.shippingDate} ${info.info.fromTime}:00`,
        );
        data[i].fromTime = convertDateTimeToUTC(
          `${info.info.shippingDate} ${info.info.fromTime}:00`,
        );
        data[i].toTime = convertDateTimeToUTC(
          `${info.info.shippingDate} ${info.info.toTime}:00`,
        );
      } else if (
        info.shippingType == "SELLERDROP" ||
        info.shippingType == "PLATFORM"
      ) {
        data[i].shippingCharge = info.info.shippingCharge;
        data[i].serviceId = info.info.serviceId;
      }

      i++;
    }

    const sellerIds = memoizedCartList.filter((item: any) => item.serviceId)
      ?.map((item: any) => item.service.sellerId) || [];

    for (let sellerId of sellerIds) {
      if (!data.find((item: any) => item.sellerId == sellerId)) {
        data[i] = {
          sellerId: sellerId,
          orderShippingType: "PICKUP",
          shippingDate: convertDateTimeToUTC(new Date().toLocaleString()),
          fromTime: convertDateTimeToUTC(new Date().toLocaleString()),
          toTime: convertDateTimeToUTC(new Date().toLocaleString()),
          shippingCharge: 0,
          serviceId: null,
        };
      }
    }

    return data;
  };

  const onSaveOrder = () => {
    if (invalidProducts.length > 0 || notAvailableProducts.length > 0) {
      toast({
        description: t("remove_n_items_from_cart", {
          n: invalidProducts.length + notAvailableProducts.length,
        }),
        variant: "danger",
      });
      return;
    }

    if (!validateShippingInfo()) {
      toast({
        title: "Shipping error",
        description: "Shipping data has errors, please check",
        variant: "danger",
      });
      return;
    }

    if (haveAccessToken) {
      if (!selectedOrderDetails?.shippingAddress) {
        toast({
          title: t("please_select_a_shipping_address"),
          variant: "danger",
        });
        return;
      }

      const data = {
        ...selectedOrderDetails,
        cartIds: memoizedCartList?.filter((item: any) => item.productId)?.map((item: CartItem) => item.id) || [],
        serviceCartIds: memoizedCartList?.filter((item: any) => item.serviceId)?.map((item: CartItem) => item.id) || [],
        deliveryCharge: shippingCharge,
        shipping: prepareShippingInfo(),
      };

      if (sameAsShipping) {
        data.billingAddress = data.shippingAddress;
        data.billingCity = data.shippingCity;
        data.billingProvince = data.shippingProvince;
        data.billingCountry = data.shippingCountry;
        data.billingPostCode = data.shippingPostCode;
      }

      if (!data.billingAddress) {
        toast({
          title: t("please_select_a_billing_address"),
          variant: "danger",
        });
        return;
      }

      const address = memoziedAddressList.find(
        (item: any) => item.id == selectedShippingAddressId,
      );

      orderStore.setOrders({
        ...data,
        ...{
          countryId: address?.countryId,
          stateId: address?.stateId,
          cityId: address?.cityId,
          town: address?.town,
          userAddressId: Number(selectedShippingAddressId),
        },
      });
      orderStore.setTotal(totalAmount);
      router.push("/complete-order");
    } else {
      // if (!guestEmail) {
      //   toast({
      //     title: t("please_enter_email_address"),
      //     variant: "danger",
      //   });
      //   return;
      // }
      // if (!validator.isEmail(guestEmail)) {
      //   toast({
      //     title: t("please_enter_valid_email_address"),
      //     variant: "danger",
      //   });
      //   return;
      // }
      // let guestOrderDetails: any = {
      //   guestUser: {
      //     firstName: "",
      //     lastName: "",
      //     email: "",
      //     cc: "",
      //     phoneNumber: "",
      //   },
      // };
      // if (!guestShippingAddress) {
      //   toast({
      //     title: t("please_add_a_shipping_address"),
      //     variant: "danger",
      //   });
      //   return;
      // }
      // if (guestShippingAddress) {
      //   guestOrderDetails = {
      //     ...guestOrderDetails,
      //     firstName: guestShippingAddress.firstName,
      //     lastName: guestShippingAddress.lastName,
      //     email: "",
      //     cc: guestShippingAddress.cc,
      //     phone: guestShippingAddress.phoneNumber,
      //     shippingAddress: guestShippingAddress.address,
      //     shippingTown: guestShippingAddress.town,
      //     shippingCity: guestShippingAddress.city,
      //     shippingProvince: guestShippingAddress.state,
      //     shippingCountry: guestShippingAddress.country,
      //     shippingPostCode: guestShippingAddress.postCode,
      //   };
      // }
      // if (!guestBillingAddress) {
      //   toast({
      //     title: t("please_add_a_billing_address"),
      //     variant: "danger",
      //   });
      //   return;
      // }
      // if (guestBillingAddress) {
      //   guestOrderDetails = {
      //     ...guestOrderDetails,
      //     billingAddress: guestBillingAddress.address,
      //     billingCity: guestBillingAddress.city,
      //     billingTown: guestBillingAddress.town,
      //     billingProvince: guestBillingAddress.state,
      //     billingCountry: guestBillingAddress.country,
      //     billingPostCode: guestBillingAddress.postCode,
      //   };
      // }
      // const data = {
      //   ...guestOrderDetails,
      //   email: guestEmail,
      //   paymentMethod: "cash",
      //   cartIds: memoizedCartList?.map((item: CartItem) => item.id) || [],
      // };
      // if (
      //   data.firstName !== "" &&
      //   data.lastName !== "" &&
      //   data.cc != "" &&
      //   data.phone !== ""
      // ) {
      //   data.guestUser = {
      //     firstName: data.firstName,
      //     lastName: data.lastName,
      //     email: guestEmail,
      //     cc: data.cc,
      //     phoneNumber: data.phone,
      //   };
      // }
      // orderStore.setOrders(data);
      // orderStore.setTotal(totalAmount);
      // router.push("/complete-order");
    }
  };

  useEffect(() => {
    if (isClickedOutside) {
      setSelectedAddressId(undefined);
    }
  }, [isClickedOutside]);

  useEffect(() => {
    if (accessToken) {
      setHaveAccessToken(true);
    } else {
      setHaveAccessToken(false);
    }
  }, [accessToken]);

  return (
    <div className="cart-page">
      <div className="container m-auto px-3">
        <div className="cart-page-wrapper">
          <div className="cart-page-left">
            <div className="bodyPart">
              <div className="card-item cart-items">
                <div className="card-inner-headerPart" dir={langDir}>
                  <div className="lediv">
                    <h3 translate="no">{t("cart_items")}</h3>
                  </div>
                </div>

                {memoizedCartList.filter((item: any) => item.productId).length > 0 ? (
                  <div className="card-inner-headerPart mt-5" dir={langDir}>
                    <div className="lediv">
                      <h3 translate="no">{t("products")}</h3>
                    </div>
                  </div>
                ) : null}

                {sellerIds.map((sellerId: number, index: number) => {
                  return (
                    <div className="cart-item-lists" key={sellerId}>
                      {memoizedCartList
                        ?.filter(
                          (item: CartItem) =>
                            item.productPriceDetails && item.productPriceDetails.adminId == sellerId,
                        )
                        ?.map((item: CartItem) => (
                          <ProductCard
                            key={item.id}
                            cartId={item.id}
                            productId={item.productId}
                            productPriceId={item.productPriceId}
                            productName={
                              item.productPriceDetails?.productPrice_product
                                ?.productName
                            }
                            offerPrice={item.productPriceDetails?.offerPrice}
                            productQuantity={item.quantity}
                            productVariant={item.object}
                            productImages={
                              item.productPriceDetails?.productPrice_product
                                ?.productImages
                            }
                            consumerDiscount={
                              item.productPriceDetails?.consumerDiscount || 0
                            }
                            consumerDiscountType={
                              item.productPriceDetails?.consumerDiscountType
                            }
                            vendorDiscount={
                              item.productPriceDetails?.vendorDiscount || 0
                            }
                            vendorDiscountType={
                              item.productPriceDetails?.vendorDiscountType
                            }
                            onAdd={handleAddToCart}
                            onRemove={(cartId: number) => {
                              setIsConfirmDialogOpen(true);
                              setSelectedCartId(cartId);
                            }}
                            onWishlist={handleAddToWishlist}
                            haveAccessToken={haveAccessToken}
                            invalidProduct={invalidProducts.includes(
                              item.productId,
                            )}
                            cannotBuy={notAvailableProducts.includes(
                              item.productId,
                            )}
                          />
                        )) || []}
                      <div className="cart-item-list-col" dir={langDir}>
                        <div className="w-full gap-2 sm:grid sm:grid-cols-3">
                          <Select
                            // @ts-ignore
                            className="mb-2"
                            options={shippingOptions()}
                            value={shippingOptions().find(
                              (option) =>
                                shippingInfo[index].shippingType ==
                                option.value,
                            )}
                            onChange={(newValue: any) => {
                              let data = shippingInfo;
                              data[index].shippingType = newValue?.value;
                              data[index].info.serviceId = null;
                              data[index].info.serviceName = null;
                              data[index].info.shippingCharge = 0;
                              setShippingInfo([...data]);
                            }}
                          />

                          {["SELLERDROP", "PLATFORM"].includes(
                            shippingInfo[index].shippingType,
                          ) ? (
                            <Button
                              onClick={() => {
                                setSelectedSellerId(sellerId);
                                setSelectedShippingType(
                                  shippingInfo[index].shippingType,
                                );
                                const item = memoizedCartList?.find(
                                  (item: CartItem) =>
                                    item.productPriceDetails.adminId ==
                                    sellerId,
                                );
                                if (item) {
                                  setFromCityId(
                                    item.productPriceDetails?.productCityId,
                                  );
                                }
                                const address = memoziedAddressList.find(
                                  (item: any) =>
                                    item.id == selectedShippingAddressId,
                                );
                                if (address) {
                                  setToCityId(address.cityId);
                                }
                                setIsShippingModalOpen(true);
                              }}
                              variant="destructive"
                              translate="no"
                            >
                              {t("select")}
                            </Button>
                          ) : null}

                          {["SELLERDROP", "PLATFORM"].includes(
                            shippingInfo[index].shippingType,
                          ) ? (
                            <>
                              {shippingInfo[index]?.info?.serviceId ? (
                                <div className="mt-2">
                                  {shippingInfo[index].info.serviceName}
                                </div>
                              ) : (
                                <span className="block w-full text-red-500">
                                  {shippingErrors?.[index]?.errors?.serviceId ||
                                    ""}
                                </span>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div></div>
                      {shippingInfo[index].shippingType == "PICKUP" ? (
                        <>
                          <div className="cart-item-list-col" dir={langDir}>
                            <div className="w-full gap-2 sm:grid sm:grid-cols-3">
                              <div>
                                <Label>Shipping Date</Label>
                                <Input
                                  type="date"
                                  value={
                                    shippingInfo[index].info?.shippingDate || ""
                                  }
                                  onChange={(e) => {
                                    let data = shippingInfo;
                                    data[index].info.shippingDate =
                                      e.target.value;
                                    setShippingInfo([...data]);
                                  }}
                                />
                                <span className="text-xs text-red-500">
                                  {shippingErrors?.[index]?.errors
                                    ?.shippingDate || ""}
                                </span>
                              </div>
                              <div>
                                <Label>From Time</Label>
                                <Input
                                  type="time"
                                  value={
                                    shippingInfo[index].info?.fromTime || ""
                                  }
                                  onChange={(e) => {
                                    let data = shippingInfo;
                                    data[index].info.fromTime = e.target.value;
                                    setShippingInfo([...data]);
                                  }}
                                />
                                <span className="text-xs text-red-500">
                                  {shippingErrors?.[index]?.errors?.fromTime ||
                                    ""}
                                </span>
                              </div>
                              <div>
                                <Label>To Time</Label>
                                <Input
                                  type="time"
                                  value={shippingInfo[index].info?.toTime || ""}
                                  onChange={(e) => {
                                    let data = shippingInfo;
                                    data[index].info.toTime = e.target.value;
                                    setShippingInfo([...data]);
                                  }}
                                />
                                <span className="text-xs text-red-500">
                                  {shippingErrors?.[index]?.errors?.toTime ||
                                    ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div></div>
                        </>
                      ) : null}
                    </div>
                  );
                })}

                {memoizedCartList.filter((item: any) => item.serviceId).length > 0 ? (
                  <div className="card-inner-headerPart mt-5" dir={langDir}>
                    <div className="lediv">
                      <h3 translate="no">{t("services")}</h3>
                    </div>
                  </div>
                ) : null}

                <div className="cart-item-lists">
                  {memoizedCartList.filter((item: any) => item.serviceId).map((item: any) => {
                    if (!item.cartServiceFeatures?.length) return null;

                    const features = item.cartServiceFeatures.map((feature: any) => ({
                      id: feature.id,
                      serviceFeatureId: feature.serviceFeatureId,
                      quantity: feature.quantity
                    }));

                    let relatedCart: any = memoizedCartList
                      ?.filter((c: any) => c.productId && c.cartProductServices?.length)
                      .find((c: any) => {
                          return !!c.cartProductServices
                              .find((r: any) => r.relatedCartType == 'SERVICE' && r.serviceId == item.serviceId);
                      });

                    return item.cartServiceFeatures.map((feature: any) => {
                      return (
                        <ServiceCard 
                          key={feature.id}
                          cartId={item.id}
                          serviceId={item.serviceId}
                          serviceFeatureId={feature.serviceFeatureId}
                          serviceFeatureName={feature.serviceFeature.name}
                          serviceCost={Number(feature.serviceFeature.serviceCost)}
                          cartQuantity={feature.quantity}
                          serviceFeatures={features}
                          relatedCart={relatedCart}
                          onRemove={() => {
                            handleRemoveServiceFromCart(item.id, feature.id);
                          }}
                        />
                      );
                    });
                  })}
                </div>
              </div>

              {!me.data ? (
                <div className="card-item selected-address">
                  <div className="card-inner-headerPart" dir={langDir}>
                    <div className="lediv">
                      <h3 translate="no">{t("your_informations")}</h3>
                    </div>
                  </div>

                  <div className="selected-address-lists">
                    <div className="space-y-2 p-3">
                      <Label dir={langDir} translate="no">
                        {t("email")}
                      </Label>
                      <Input
                        className="theme-form-control-s1"
                        placeholder={t("enter_email")}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        value={guestEmail}
                        dir={langDir}
                        translate="no"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="card-item selected-address">
                <div className="card-inner-headerPart" dir={langDir}>
                  <div className="lediv">
                    <h3 translate="no">
                      {me?.data
                        ? t("select_shipping_address")
                        : t("shipping_address")}
                    </h3>
                  </div>
                </div>

                <div className="selected-address-lists">
                  {/* {!memoziedAddressList.length &&
                  !allUserAddressQuery.isLoading ? (
                    <div className="px-3 py-6">
                      <p className="my-3 text-center">No address added</p>
                    </div>
                  ) : null} */}

                  {/* <div className="px-3">
                    {allUserAddressQuery.isLoading ? (
                      <div className="my-3 space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full" />
                        ))}
                      </div>
                    ) : null}
                  </div> */}

                  <RadioGroup
                    // defaultValue={selectedAddressId?.toString()}
                    value={selectedShippingAddressId?.toString()}
                    onValueChange={(value) =>
                      setSelectedShippingAddressId(value)
                    }
                    className=""
                  >
                    {memoziedAddressList?.map((item: AddressItem) => (
                      <AddressCard
                        key={item.id}
                        id={item.id}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        cc={item.cc}
                        phoneNumber={item.phoneNumber}
                        address={item.address}
                        town={item.town}
                        city={item.cityDetail}
                        country={item.countryDetail}
                        state={item.stateDetail}
                        postCode={item.postCode}
                        onEdit={() => {
                          setSelectedAddressId(item.id);
                          handleToggleAddModal();
                        }}
                        onDelete={() => handleDeleteAddress(item.id)}
                        onSelectAddress={() =>
                          handleOrderDetails(item, "shipping")
                        }
                      />
                    ))}
                  </RadioGroup>

                  {guestShippingAddress ? (
                    <GuestAddressCard
                      firstName={guestShippingAddress?.firstName}
                      lastName={guestShippingAddress?.lastName}
                      cc={guestShippingAddress?.cc}
                      phoneNumber={guestShippingAddress?.phoneNumber}
                      address={guestShippingAddress?.address}
                      city={guestShippingAddress?.city}
                      town={guestShippingAddress?.town}
                      state={guestShippingAddress?.state}
                      country={guestShippingAddress?.country}
                      postCode={guestShippingAddress?.postCode}
                      onEdit={() => {
                        setAddressType("shipping");
                        handleToggleAddModal();
                      }}
                    />
                  ) : null}
                </div>

                {!me.data && !guestShippingAddress ? (
                  <div className="card-item cart-items for-add">
                    <div className="top-heading" dir={langDir}>
                      <Button
                        variant="outline"
                        type="button"
                        className="add-new-address-btn border-none p-0 !normal-case shadow-none"
                        onClick={() => {
                          setAddressType("shipping");
                          handleToggleAddModal();
                        }}
                        translate="no"
                      >
                        <Image
                          src={AddIcon}
                          alt="add-icon"
                          height={14}
                          width={14}
                        />{" "}
                        {t("add_new_shipping_address")}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="card-item selected-address">
                <div className="card-inner-headerPart" dir={langDir}>
                  <div className="lediv">
                    <h3 translate="no">
                      {me?.data
                        ? t("select_billing_address")
                        : t("billing_address")}
                    </h3>
                  </div>

                  <div className="rgdiv">
                    {selectedOrderDetails?.shippingAddress ? (
                      <div className="textwithcheckbox">
                        <Checkbox
                          id="same_as_shipping"
                          className="border border-solid border-gray-300 bg-white data-[state=checked]:!bg-dark-orange"
                          onCheckedChange={() => {
                            setSameAsShipping(!sameAsShipping);

                            // since state is not updated immediately, making inverted checking
                            if (sameAsShipping) {
                              setSelectedOrderDetails({
                                ...selectedOrderDetails,
                                billingAddress: "",
                                billingCity: "",
                                billingProvince: "",
                                billingCountry: "",
                                billingPostCode: "",
                              });
                            }
                          }}
                          checked={sameAsShipping}
                        />
                        <Label
                          htmlFor="same_as_shipping"
                          dir={langDir}
                          translate="no"
                        >
                          {t("same_as_shipping_address")}
                        </Label>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="selected-address-lists">
                  {/* {!memoziedAddressList.length &&
                  !allUserAddressQuery.isLoading ? (
                    <div className="px-3 py-6">
                      <p className="my-3 text-center">No address added</p>
                    </div>
                  ) : null} */}

                  {/* <div className="px-3">
                    {allUserAddressQuery.isLoading ? (
                      <div className="my-3 space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full" />
                        ))}
                      </div>
                    ) : null}
                  </div> */}

                  {!sameAsShipping ? (
                    <RadioGroup
                      value={selectedBillingAddressId?.toString()}
                      onValueChange={(value) =>
                        setSelectedBillingAddressId(value)
                      }
                      // defaultValue="comfortable"
                      className=""
                    >
                      {memoziedAddressList?.map((item: AddressItem) => (
                        <AddressCard
                          key={item.id}
                          id={item.id}
                          firstName={item.firstName}
                          lastName={item.lastName}
                          cc={item.cc}
                          phoneNumber={item.phoneNumber}
                          address={item.address}
                          town={item.town}
                          city={item.cityDetail}
                          country={item.countryDetail}
                          state={item.stateDetail}
                          postCode={item.postCode}
                          onEdit={() => {
                            setSelectedAddressId(item.id);
                            handleToggleAddModal();
                          }}
                          onDelete={() => handleDeleteAddress(item.id)}
                          onSelectAddress={() =>
                            handleOrderDetails(item, "billing")
                          }
                        />
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="px-3 py-6">
                      <p
                        className="my-3 text-center"
                        dir={langDir}
                        translate="no"
                      >
                        {t("same_as_shipping_address")}
                      </p>
                    </div>
                  )}

                  {guestBillingAddress ? (
                    <GuestAddressCard
                      firstName={guestBillingAddress?.firstName}
                      lastName={guestBillingAddress?.lastName}
                      cc={guestBillingAddress?.cc}
                      phoneNumber={guestBillingAddress?.phoneNumber}
                      address={guestBillingAddress?.address}
                      city={guestBillingAddress?.city}
                      town={guestBillingAddress?.town}
                      state={guestBillingAddress?.state}
                      country={guestBillingAddress?.country}
                      postCode={guestBillingAddress?.postCode}
                      onEdit={() => {
                        setAddressType("billing");
                        handleToggleAddModal();
                      }}
                    />
                  ) : null}
                </div>

                {!me.data && !guestBillingAddress ? (
                  <div className="card-item cart-items for-add">
                    <div className="top-heading" dir={langDir}>
                      <Button
                        variant="outline"
                        type="button"
                        className="add-new-address-btn border-none p-0 !normal-case shadow-none"
                        onClick={() => {
                          setAddressType("billing");
                          handleToggleAddModal();
                        }}
                        translate="no"
                      >
                        <Image
                          src={AddIcon}
                          alt="add-icon"
                          height={14}
                          width={14}
                        />{" "}
                        {t("add_new_billing_address")}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {me.data ? (
                <div className="card-item cart-items for-add">
                  <div className="top-heading" dir={langDir}>
                    <Button
                      variant="outline"
                      type="button"
                      className="add-new-address-btn border-none p-0 !normal-case shadow-none"
                      onClick={handleToggleAddModal}
                      dir={langDir}
                      translate="no"
                    >
                      <Image
                        src={AddIcon}
                        alt="add-icon"
                        height={14}
                        width={14}
                      />{" "}
                      {t("add_new_address")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="cart-page-right">
            <div className="card-item priceDetails">
              <div className="card-inner-headerPart" dir={langDir}>
                <div className="lediv">
                  <h3 translate="no">{t("price_details")}</h3>
                </div>
              </div>
              <div className="priceDetails-body">
                <ul>
                  <li dir={langDir}>
                    <p translate="no">{t("subtotal")}</p>
                    <h5>
                      {currency.symbol}
                      {itemsTotal}
                    </h5>
                  </li>
                  <li dir={langDir}>
                    <p translate="no">{t("shipping")}</p>
                    {shippingCharge > 0 ? (
                      <h5>
                        {currency.symbol}
                        {shippingCharge}
                      </h5>
                    ) : (
                      <h5 translate="no">{t("free")}</h5>
                    )}
                  </li>
                  <li dir={langDir}>
                    <p translate="no">{t("fee")}</p>
                    <h5>
                      {currency.symbol}
                      {fee}
                    </h5>
                  </li>
                </ul>
              </div>
              <div className="priceDetails-footer" dir={langDir}>
                <h4 translate="no">{t("total_amount")}</h4>
                <h4 className="amount-value">
                  {currency.symbol}
                  {totalAmount}
                </h4>
              </div>
            </div>
            <div className="order-action-btn">
              <Button
                onClick={onSaveOrder}
                disabled={
                  !memoizedCartList?.length ||
                  updateCartByDevice?.isPending ||
                  updateCartWithLogin?.isPending ||
                  cartListByDeviceQuery?.isFetching ||
                  cartListByUser?.isFetching ||
                  allUserAddressQuery?.isLoading ||
                  preOrderCalculation?.isPending
                }
                className="theme-primary-btn order-btn"
                translate="no"
              >
                {preOrderCalculation?.isPending ? (
                  <LoaderWithMessage message={t("please_wait")} />
                ) : (
                  t("continue")
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={handleToggleAddModal}>
        <DialogContent
          className="add-new-address-modal gap-0 p-0"
          ref={wrapperRef}
        >
          {me.data ? (
            <AddressForm
              onClose={() => {
                setIsAddModalOpen(false);
                setSelectedAddressId(undefined);
              }}
              addressId={selectedAddressId}
            />
          ) : (
            <GuestAddressForm
              onClose={() => {
                setIsAddModalOpen(false);
                setSelectedAddressId(undefined);
              }}
              addressType={addressType}
              setGuestShippingAddress={setGuestShippingAddress}
              setGuestBillingAddress={setGuestBillingAddress}
              guestShippingAddress={guestShippingAddress}
              guestBillingAddress={guestBillingAddress}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={handleConfirmDialog}>
        <DialogContent
          className="add-new-address-modal add_member_modal gap-0 p-0 md:!max-w-2xl"
          ref={confirmDialogRef}
        >
          <div className="modal-header !justify-between" dir={langDir}>
            <DialogTitle className="text-center text-xl font-bold text-dark-orange"></DialogTitle>
            <Button
              onClick={onCancelRemove}
              className={`${langDir == "ltr" ? "absolute" : ""} right-2 top-2 z-10 !bg-white !text-black shadow-none`}
            >
              <IoCloseSharp size={20} />
            </Button>
          </div>

          <div className="mb-4 mt-4 text-center">
            <p className="text-dark-orange">
              Do you want to remove this item from cart?
            </p>
            <div>
              <Button
                type="button"
                className="mr-2 bg-white text-red-500"
                onClick={onCancelRemove}
                translate="no"
              >
                {t("remove")}
              </Button>
              <Button
                type="button"
                className="bg-red-500"
                onClick={onConfirmRemove}
                translate="no"
              >
                {t("remove")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShippingModalOpen} onOpenChange={handleShippingModal}>
        <DialogContent
          className="add-new-address-modal add_member_modal gap-0 p-0 md:!max-w-2xl"
          ref={shippingModalRef}
        >
          <Shipping
            sellerId={selectedSellerId}
            type={`${selectedShippingType == "PLATFORM" ? "other" : "own"}`}
            fromCityId={fromCityId}
            toCityId={toCityId}
            onClose={() => {
              setSelectedSellerId(undefined);
              setSelectedShippingType(undefined);
              setFromCityId(undefined);
              setToCityId(undefined);
              setIsShippingModalOpen(false);
            }}
            onSelect={(sellerId: number, item: any) => {
              const index = shippingInfo.findIndex(
                (item: any) => item.sellerId == sellerId,
              );
              const shipping = shippingInfo.find(
                (item: any) => item.sellerId == sellerId,
              );
              if (shipping) {
                const info = shippingInfo;
                info[index].info.serviceId = item.id;
                info[index].info.serviceName = item.serviceName;
                info[index].info.shippingCharge = Number(
                  item.serviceFeatures?.[0]?.serviceCost,
                );
                setShippingInfo([...info]);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
