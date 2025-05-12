import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";
// export const fetchBrands = () => {
//   return axios({
//     method: "GET",
//     url: `${process.env.REACT_APP_API_URL}brand/getAllBrand?page=1&limit=100`,
//   });
// };
export const fetchBrands = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}brand/getAllBrand`, query), // Include page and limit in the URL
  });
};

export const createBrand = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}brand/addBrand`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateBrands = (payload: any) => {
  console.log("payload", payload);
  return axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}brand/update`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

// export const updateBrands = () => {
//   return axios({
//     method: "PATCH",
//     url: `${process.env.REACT_APP_API_URL}brand/update`,
//   });
// };

export const deleteBrands = (brandId: any) => {
  return axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}brand/delete/${brandId}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchBrandsByType = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}brand/findAll`, query), // Include page and limit in the URL
  });
};
