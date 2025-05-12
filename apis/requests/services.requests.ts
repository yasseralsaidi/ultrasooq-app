import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { getCookie } from "cookies-next";
import axios from "axios";
import urlcat from "urlcat";
import {
} from "@/utils/types/product.types";

export const createService = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/service/create`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateService = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/service/${payload?.serviceId}`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchAllServices = (payload: { page: number; limit: number; term?: string; sort?: string; brandIds?: string; priceMin?: number; priceMax?: number; userId?: number; categoryIds?: string; isOwner?: string; ownservice?: boolean }) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/service/list`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchServiceById = (payload: {
  serviceid: string;
  userId?: number;
  sharedLinkId?: string;
}) => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/service/${payload.serviceid}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const addServiceToCart = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/cart/updateservice`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchServicesBySeller = (payload: {
  page: number;
  limit: number;
  sellerId: number;
  fromCityId?: number;
  toCityId?: number
}) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/service/getAllServiceBySeller`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchServicesByOtherSeller = (payload: {
  page: number;
  limit: number;
  sellerId: number;
  fromCityId?: number;
  toCityId?: number
}) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/service/getAllServiceOfOtherSeller`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchServicesByProductCategory = (payload: {
  categoryId: string;
  page: number;
  limit: number;
}) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/service/getAllServiceRelatedProductCategoryId`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
}