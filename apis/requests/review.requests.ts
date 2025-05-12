import axios from "axios";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import urlcat from "urlcat";

export const fetchReviews = (payload: {
  page: number;
  limit: number;
  productId: string;
  sortType?: "highest" | "lowest" | "newest";
}) => {
  return axios({
    method: "GET",
    url: urlcat(
      `${process.env.NEXT_PUBLIC_API_URL}/product/getAllProductReview`,
      payload,
    ),
  });
};

export const addReview = (payload: {
  productId: number;
  title: string;
  description: string;
  rating: number;
}) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/addProductReview`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateReview = (payload: {
  productReviewId: number;
  title: string;
  description: string;
  rating: number;
}) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/editProductReview`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchReviewById = (payload: { productReviewId: number }) => {
  return axios({
    method: "GET",
    url: urlcat(
      `${process.env.NEXT_PUBLIC_API_URL}/product/getOneProductReview`,
      payload,
    ),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

// export const fetchAllReviewBySellerId = (payload: {
//   page: number;
//   limit: number;
//   sortType?: "highest" | "lowest" | "newest";
// }) => {
//   return axios({
//     method: "GET",
//     url: urlcat(
//       `${process.env.NEXT_PUBLIC_API_URL}/product/getAllProductReviewBySellerId`,
//       payload,
//     ),
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
//     },
//   });
// };

export const addSellerReview = (payload: {
  productPriceId: number;
  adminId: number;
  productId: number;
  title: string;
  description: string;
  rating: number;
}) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/addProductPriceReview`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateSellerReview = (payload: {
  productReviewId: number;
  title: string;
  description: string;
  rating: number;
}) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/updateOneProductPriceReview`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchSellerReviewById = (payload: {
  productPriceReviewId: number;
}) => {
  return axios({
    method: "GET",
    url: urlcat(
      `${process.env.NEXT_PUBLIC_API_URL}/product/getOneProductPriceReview`,
      payload,
    ),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchAllProductPriceReviewBySellerId = (payload: {
  page: number;
  limit: number;
  sortType?: "highest" | "lowest" | "newest";
  sellerId: string;
}) => {
  return axios({
    method: "GET",
    url: urlcat(
      `${process.env.NEXT_PUBLIC_API_URL}/product/getAllProductPriceReviewBySellerId`,
      payload,
    ),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
