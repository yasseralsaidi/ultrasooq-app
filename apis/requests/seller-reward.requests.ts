import axios from "axios";
import { getCookie } from "cookies-next";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import urlcat from "urlcat";

export const fetchSellerRewards = (payload: {
    page: number;
    limit: number;
    term?: string;
    productId?: string;
    sortType?: "asc" | "desc";
}) => {
    return axios({
        method: "GET",
        url: urlcat(
            `${process.env.NEXT_PUBLIC_API_URL}/product/getAllSellerReward`,
            payload,
        ),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        }
    });
};

export const addSellerReward = (payload: {
    productId: number;
    startTime: string;
    endTime: string;
    rewardPercentage: number;
    rewardFixAmount: number;
    minimumOrder: number;
    stock: number
}) => {
    return axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_API_URL}/product/createSellerRewardProduct`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchShareLinks = (payload: {
    page: number;
    limit: number;
    productId?: string;
    sortType?: "asc" | "desc";
}) => {
    return axios({
        method: "GET",
        url: urlcat(
            `${process.env.NEXT_PUBLIC_API_URL}/product/getAllGenerateLink`,
            payload,
        ),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        }
    });
};

export const createShareLink = (payload: {
    sellerRewardId: number;
}) => {
    return axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_API_URL}/product/generateLink`,
        data: Object.assign(payload, { generatedLink: "generatedLink" }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const fetchShareLinksBySellerRewardId = (payload: {
    page: number;
    limit: number;
    term?: string;
    sellerRewardId?: string;
    sortType?: "asc" | "desc";
}) => {
    return axios({
        method: "GET",
        url: urlcat(
            `${process.env.NEXT_PUBLIC_API_URL}/product/getAllGenerateLinkBySellerRewardId`,
            payload,
        ),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
        }
    });
};