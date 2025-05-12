import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchPolicies = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}policy/getAllPolicy`, query), // Include page and limit in the URL
  });
};

export const fetchSinglePolicy = (query: any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}policy/getOnePolicy`, query), // Include page and limit in the URL
  });
};

export const createPolicy = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}policy/createPolicy`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updatePolicy = (payload: any) => {
//   console.log("payload", payload);
  return axios({
    method: "PATCH",
    url: `${process.env.REACT_APP_API_URL}policy/updatePolicy`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
export const deletePolicy = (id: any) => {
  return axios({
    method: "DELETE",
    url: `${process.env.REACT_APP_API_URL}policy/deletePolicy/${id}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
