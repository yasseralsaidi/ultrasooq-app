import axios from "axios";
import urlcat from "urlcat";

export const fetchCountries = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}product/countryList`,
  });
};

export const fetchLocation = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}product/locationList`,
  });
};

export const fetchAllCountries = () => {
  return axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_URL}admin/getAllCountry`,
  });
};

export const fetchAllStates = (query:any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}admin/getAllStates`, query), // Include page and limit in the URL
  });
};
export const fetchAllCities = (query:any) => {
  return axios({
    method: "GET",
    url: urlcat(`${process.env.REACT_APP_API_URL}admin/getAllCities`, query), // Include page and limit in the URL
  });
};