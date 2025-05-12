import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchAllServices = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}admin/service/get-all`, query), // Include page and limit in the URL
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchServiceById = (payload: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}admin/service/get-one`, payload),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
// export const fetchCategoryProd = (payload: { categoryId?: string }) => {
//   return axios({
//     method: "GET",
//     url: urlcat(`${process.env.REACT_APP_API_URL}category/findOne`, payload),
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
//     },
//   });
// };

// export const deleteProduct = (productId: any) => {
//   return axios({
//     method: "DELETE",
//     url: `${process.env.REACT_APP_API_URL}admin/deleteProduct/${productId}`,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
//     },
//   });
// };


// export const updateProduct = (payload: any) => {
//   return axios({
//     method: "PATCH",
//     url: `${process.env.REACT_APP_API_URL}admin/updateProduct`,
//     data: payload,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
//     },
//   });
// };
