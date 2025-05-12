import axios from "axios";
import Cookie from "../../utils/Cookie";
import { isEmpty } from "lodash";
import { PRODUCT_CATEGORY_ID, PUREMOON_TOKEN_KEY } from "../../utils/constants";
import urlcat from "urlcat";

export const fetchCategories = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}category/findOne?categoryId=1`,
  });
};

export const fetchProductCategories = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}category/findOne?categoryId=${PRODUCT_CATEGORY_ID}`,
  });
}

export const fetchChildrenCategories = (categoryId: number) => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}category/findOne?categoryId=${categoryId}`,
  });
}

export const fetchCategoryById = (payload: { categoryId: string }) => {
  const query = new URLSearchParams();

  if (payload?.categoryId && !isEmpty(payload.categoryId)) {
    query.append("categoryId", String(payload.categoryId));
  }

  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}category/findOne?${query}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const createMultipleCategory = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}category/createMultiple`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
export const assignMultipleCategory = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/assignFormToCategory`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
export const fetchCategoriesassign = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}category/findOne`, query), // Include page and limit in the URL
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer ",
    },
  });
};
export const fetchdCategoriesassign = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}category/findOne`, query), // Include page and limit in the URL
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer ",
    },
  });
};

export const updateCategory = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}category/update`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const deleteCategory = (categoryId: string) => {
  return axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}category/delete/${categoryId}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateWhiteBlackList = (payload: any) => {
  return axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}category/updateWhiteBlackList`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchCategory = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}category/findOne?categoryId=1`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchSubCategoriesById = (payload: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}category/findOne`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
