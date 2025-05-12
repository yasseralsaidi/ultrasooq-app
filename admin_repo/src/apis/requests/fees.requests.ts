import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchAllFees = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}fees/getAllFees`, query), // Include page and limit in the URL
    });
};
export const fetchOneFees = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}fees/getOneFees`, query), // Include page and limit in the URL
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};
export const addFees = (payload: any) => {
    return axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}fees/createFees`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};
export const updateFees = (payload: any) => {
    return axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}fees/updateFees`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const deleteFees = (id: any) => {
    return axios({
        method: "DELETE",
        url: `${process.env.REACT_APP_API_URL}fees/deleteFees/${id}`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const connectFeeToCategories = (payload: any) => {
    return axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}fees/addCategoryToFees`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};