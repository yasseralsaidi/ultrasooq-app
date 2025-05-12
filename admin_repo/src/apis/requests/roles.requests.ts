import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchRoles = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin-member/role/get-all`, query),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchRole = (roleId: number) => {
    return axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}admin-member/getOneAdminRole-with-permission?adminRoleId=${roleId}`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const createRole = (payload: any) => {
    return axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}admin-member/role/create`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const updateRole = (payload: any) => {
    return axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}admin-member/role/update`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchPermissions = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin-member/permission/get-all`, query),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const setRolePermissions = (payload: any) => {
    return axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}admin-member/update-set-permission`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};