import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import axios from "axios";
import { getCookie } from "cookies-next";
import urlcat from "urlcat";

export const fetchTransactions = (payload: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.NEXT_PUBLIC_API_URL}/payment/transaction/getl-all`, payload),
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};