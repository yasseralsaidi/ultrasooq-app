import { useMutation, useQuery } from "@tanstack/react-query";
import { APIResponseError } from "@/utils/types/common.types";
import {
  createCompanyBranch,
  createCompanyProfile,
  fetchCompanyBranchById,
  updateCompanyBranch,
  updateCompanyProfile,
} from "../requests/company.requests";
import { useQueryClient } from "@tanstack/react-query";
import {
  ICompany,
  ICreateCompanyBranch,
  ICreateCompanyBranchRequest,
  IEditCompanyBranch,
  IEditCompanyBranchRequest,
  IEditCompanyProfile,
  IEditCompanyProfileRequest,
} from "@/utils/types/user.types";

export const useCreateCompanyProfile = () => {
  const queryClient = useQueryClient();

  //TODO: add types definition
  return useMutation<ICompany, APIResponseError, {}>({
    mutationFn: async (payload) => {
      const res = await createCompanyProfile(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unique-user"]
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IEditCompanyProfile,
    APIResponseError,
    IEditCompanyProfileRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateCompanyProfile(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unique-user"]
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateCompanyBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IEditCompanyBranch,
    APIResponseError,
    IEditCompanyBranchRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateCompanyBranch(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unique-user"]
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useCreateCompanyBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICreateCompanyBranch,
    APIResponseError,
    ICreateCompanyBranchRequest
  >({
    mutationFn: async (payload) => {
      const res = await createCompanyBranch(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unique-user"]
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useFetchCompanyBranchById = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["branch-by-id", id],
    queryFn: async () => {
      const res = await fetchCompanyBranchById({ branchId: id });
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });
