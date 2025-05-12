import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPolicy,
  deletePolicy,
  //   deletePolicies,
    fetchPolicies,
    fetchSinglePolicy,
    updatePolicy,
  //   updatePolicy,
  } from "../requests/policies.request";

export const usePolicies = (query: any, enabled = true) =>
  useQuery({
    queryKey: ["policies", query],
    queryFn: async () => {
      const res = await fetchPolicies(query); // Pass page and limit to fetchBrands
      return res.data;
    },
    enabled,
  });
  export const useSinglePolicy = (query: any, enabled = true) =>
    useQuery({
      queryKey: ["single-policy", query],
      queryFn: async () => {
        const res = await fetchSinglePolicy(query); // Pass page and limit to fetchBrands
        return res.data;
      },
      enabled,
    });
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await createPolicy(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
    //   console.log("payload2", payload);
      const res = await updatePolicy(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await deletePolicy(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
