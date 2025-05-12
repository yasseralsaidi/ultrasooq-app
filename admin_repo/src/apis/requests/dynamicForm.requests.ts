import axios from "axios";
import Cookie from "../../utils/Cookie";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";

export const fetchAllDynamicForms = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/dynamicFormDetailsList`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchDynamicFormByID = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/findDynamicFormById`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const createDynamicForm = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/createDynamicForm`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateDynamicForm = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/dynamicFormDetailsEdit`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const removeDynamicForm = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}admin/dynamicFormDetailsDelete`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // TODO: remove later
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
