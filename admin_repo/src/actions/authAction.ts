import api from "../services/Axios";

export const loginApi = (payload: any) => {
  return api
    .post("admin/login", payload)
    .then((response: any) => response)
    .catch((err: any) => err);
};

// -------------------------------------------------User Information------------------------------------------
export const ME = () => {
  return api
    .get("admin/me")
    .then((response: any) => response)
    .catch((err: any) => err);
};
