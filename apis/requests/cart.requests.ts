import axios from "axios";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import urlcat from "urlcat";

export const fetchCartByUserId = (payload: { page: number; limit: number }) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/cart/list`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchCartByDevice = (payload: {
  page: number;
  limit: number;
  deviceId: string;
}) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/cart/listUnAuth`, payload),
  });
};

export const updateCartWithLogin = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/update`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateCartByDevice = (payload: {
  productPriceId: number;
  quantity: number;
  deviceId: string;
  sharedLinkId?: number;
  productVariant?: any;
}) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/updateUnAuth`,
    data: payload,
  });
};

export const updateCartWithService = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/updateservice/product`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const deleteCartItem = (payload: { cartId: number }) => {
  return axios({
    method: "DELETE",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/cart/delete`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const deleteServiceFromCart = (cartId: number, serviceFeatureId?: number) => {
  let payload: any = {};
  if (serviceFeatureId) {
    payload.servicefeatureids = serviceFeatureId.toString();
  }
  return axios({
    method: "DELETE",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/cart/deleteService/${cartId}`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateUserCartByDeviceId = (payload: { deviceId: string }) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/updateUserIdBydeviceId`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchCartCountWithLogin = () => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/cartCount`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchCartCountByDeviceId = (payload: { deviceId: string }) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/cartCountUnAuth`,
    data: payload,
  });
};

export const addServiceToCartWithProduct = (payload: {[key: string]: any}) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/updateCartServiceWithProduct`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
