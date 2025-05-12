import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";
import urlcat from "urlcat";

export const fetchHelpCenterQueries = (query: any) => {
    return axios({
        method: "GET",
        url: urlcat(`${process.env.REACT_APP_API_URL}admin/help-center/get-all`, query), // Include page and limit in the URL
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};

export const replyToQuery = (payload: any) => {
    return axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}admin/help-center/reply`,
        data: payload,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
        },
    });
};