import { useMutation } from "@tanstack/react-query";
import { APIResponseError } from "@/utils/types/common.types";
import {
  createFreelancerProfile,
  updateFreelancerActiveStatus,
  updateFreelancerBranch,
  updateFreelancerProfile,
} from "../requests/freelancer.requests";
import {
  IEditFreelancerProfileRequest,
  IFreelancer,
  IFreelancerRequest,
  IFreelancerStatus,
  IFreelancerStatusRequest,
  TUnionEditFreelancerBranchRequest,
} from "@/utils/types/user.types";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateFreelancerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<IFreelancer, APIResponseError, IFreelancerRequest>({
    mutationFn: async (payload) => {
      const res = await createFreelancerProfile(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateFreelancerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IFreelancer,
    APIResponseError,
    IEditFreelancerProfileRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateFreelancerProfile(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateFreelancerBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IFreelancer,
    APIResponseError,
    TUnionEditFreelancerBranchRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateFreelancerBranch(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdatFreelancerActiveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IFreelancerStatus,
    APIResponseError,
    IFreelancerStatusRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateFreelancerActiveStatus(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};
