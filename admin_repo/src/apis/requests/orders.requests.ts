import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchOrders = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/order/get-all`, query), // Include page and limit in the URL
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchOrderById = (payload: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/order/get-one`, payload),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchOrderProducts = (payload: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/order/order-product/get-all`, payload),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchOrderProductById = (payload: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/order/order-product/get-one`, payload),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};