import api from "../services/Axios";

export const TermCondition = () => {
  return api
    .get("get/terms-condition")
    .then((response) => response)
    .catch((err) => err);
};

export const PrivacyCondition = () => {
  return api
    .get("get/privacy-policy")
    .then((response) => response)
    .catch((err) => err);
};

export const CountryList = () => {
  return api
    .get(`controller/country/countryList`)
    .then((response) => response)
    .catch((err) => err);
};
