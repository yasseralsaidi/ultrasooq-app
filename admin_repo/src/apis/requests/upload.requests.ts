import axios from "axios";
import { PUREMOON_TOKEN_KEY } from "../../utils/constants";
import Cookie from "../../utils/Cookie";

export const uploadFile = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_URL}user/presignedUrlUpload`,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: "Bearer " + Cookie.getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};
