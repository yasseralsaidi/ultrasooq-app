import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBrand,
  deleteBrands,
  fetchBrands,
  fetchBrandsByType,
  updateBrands,
} from "../requests/brand.requests";

export const useBrands = (query: any, enabled = true) =>
  useQuery({
    queryKey: ["brands", query],
    queryFn: async () => {
      const res = await fetchBrands(query); // Pass page and limit to fetchBrands
      return res.data;
    },
    enabled,
  });

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await createBrand(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useUpdateBrands = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      console.log("payload2", payload);
      const res = await updateBrands(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useDeleteBrands = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (brandId) => {
      const res = await deleteBrands(brandId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useBrandsByType = (type?: string, query: any = {}, enabled = true) =>
  useQuery({
    queryKey: ["brands", query],
    queryFn: async () => {
      const res = await fetchBrandsByType({...{ type }, ...query}); // Pass page and limit to fetchBrands
      return res.data;
    },
    enabled,
  });
