import { useQuery } from "@tanstack/react-query";
import { fetchAllCities, fetchAllCountries, fetchAllStates, fetchCountries, fetchLocation } from "../requests/masters.requests";

export const useCountries = (enabled = true) =>
  useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetchCountries();
      return res.data;
    },
    enabled,
  });

export const useLocation = (enabled = true) =>
  useQuery({
    queryKey: ["location"],
    queryFn: async () => {
      const res = await fetchLocation();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useGetAllCountries = (enabled = true) =>
  useQuery({
    queryKey: ["allcountries"],
    queryFn: async () => {
      const res = await fetchAllCountries();
      return res.data;
    },
    enabled,
  });

export const useGetAllStates = (payload: any) =>
  useQuery({
    queryKey: ["allstates"],
    queryFn: async () => {
      const res = await fetchAllStates({ countryId: payload.countryId });
      return res.data;
    },
    enabled: payload.enabled,
  });

export const useGetCities = (payload: any) =>
  useQuery({
    queryKey: ["allcities"],
    queryFn: async () => {
      const res = await fetchAllCities({ stateId: payload.stateId });
      return res.data;
    },
    enabled: payload.enabled,
  });