import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchMembers = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin-member/get-all`, query), // Include page and limit in the URL
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchMember = (memberId: number) => {
    return axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}admin-member/get-one?adminMemberId=${memberId}`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const createMember = (payload: any) => {
    return axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}admin-member/create`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const updateMember = (payload: any) => {
    return axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}admin-member/update`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};