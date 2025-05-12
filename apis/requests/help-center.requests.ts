import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import axios from "axios";
import { getCookie } from "cookies-next";

export const fetchHelpCenterQueries = (payload: any) => {
    return axios({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_API_URL}/user/help-center/get-all`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const submitQuery = (payload: {
    userId?: number;
    email: string;
    query: string;
}) => {
    return axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_API_URL}/user/help-center/create`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};