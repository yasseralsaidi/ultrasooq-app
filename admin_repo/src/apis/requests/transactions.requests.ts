import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchTransactions = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/transaction/get-all`, query), // Include page and limit in the URL
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchTransactionById = (payload: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/transaction/get-one`, payload),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};