import axios from "axios";
import { isEmpty } from "lodash";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { getCookie } from "cookies-next";
import urlcat from "urlcat";

export const fetchCountries = () => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/countryList`,
  });
};

export const fetchBrands = (payload: { term?: string, addedBy?: number, type?: string }) => {
  const query = new URLSearchParams();
  query.append("addedBy", String(payload.addedBy))

  if (payload.term) query.append("term", String(payload.term));
  if (payload.type) query.append("type", String(payload.type));

  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/brand/findAll?${query}`,
  });
};

export const fetchuserRoles = () => {
  const query = new URLSearchParams();
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/getAllUserRole?${query}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchuserRolesWithPagination = (payload: { page: number; limit: number;}) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/user/getAllUserRole`, payload,),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const deleteMemberRole = (payload: { id: number;}) => {
  return axios({
    method: "DELETE",
    url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/user/deleteUserRole`, payload,),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};



export const createBrand = (payload: { brandName: string }) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/brand/addBrandByUser`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const createUserRole = (payload: { userRoleName: string }) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/createUserRole`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const copyUserRole = (payload: { userRoleId: number }) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/copy-userRole-with-permission`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const updateUserRole = (payload: { userRoleName: string }) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/updateUserRole`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const fetchLocation = () => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/product/locationList`,
  });
};

export const fetchAllCountry = () => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/admin/getAllCountry?page=1&limit=1000&sort=desc`,
  });
};

export const fetchStatesByCountry = (payload: { countryId: number }) => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/admin/getAllStates?countryId=${payload.countryId}&page=1&limit=5000&sort=desc`,
  });
};

export const fetchCitiesByState = (payload: { stateId: number }) => {
  return axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/admin/getAllCities?stateId=${payload.stateId}&page=1&limit=50000&sort=desc`,
  });
};
