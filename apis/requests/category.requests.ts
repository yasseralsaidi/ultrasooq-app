import { ADMIN_BEARER, PUREMOON_TOKEN_KEY } from "@/utils/constants";
import axios from "axios";
import { getCookie } from "cookies-next";
import { isEmpty } from "lodash";
import urlcat from "urlcat";

export const fetchCategory = (payload: { categoryId?: string }) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/category/findOne`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      // Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
      Authorization: "Bearer " + ADMIN_BEARER,
    },
  });
};

export const fetchCategories = () => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/category/findAll?page=1&limit=10`,
  });
};

export const fetchSubCategoriesById = (payload: { categoryId: string }) => {
  const query = new URLSearchParams();

  if (!isEmpty(payload.categoryId)) {
    query.append("categoryId", String(payload.categoryId));
  }

  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/category/findOne?${query}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
