import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  createBrand,
  fetchBrands,
  fetchCountries,
  fetchLocation,
  fetchAllCountry,
  fetchStatesByCountry,
  fetchCitiesByState,
  createUserRole,
  fetchuserRoles,
  updateUserRole,
  fetchuserRolesWithPagination,
  deleteMemberRole,
  copyUserRole
} from "../requests/masters.requests";
import { APIResponseError } from "@/utils/types/common.types";

export const useCountries = (enabled = true) =>
  useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetchCountries();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useBrands = (payload: { term?: string, addedBy?: number, type?: string }, enabled = true) =>
  useQuery({
    queryKey: ["brands", payload],
    queryFn: async () => {
      const res = await fetchBrands(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useUserRoles = (enabled = true) =>
  useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const res = await fetchuserRoles();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useUserRolesWithPagination = (payload: { page: number; limit: number; }, enabled = true) =>
  useQuery({
    queryKey: ["userRoles", payload],
    queryFn: async () => {
      const res = await fetchuserRolesWithPagination(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useDeleteMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { id: number }
  >({
    mutationFn: async (payload) => {
      const res = await deleteMemberRole(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
}



export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { brandName: string }
  >({
    mutationFn: async (payload) => {
      const res = await createBrand(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { userRoleName: string }
  >({
    mutationFn: async (payload) => {
      const res = await createUserRole(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useCopyUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { userRoleId: number }
  >({
    mutationFn: async (payload) => {
      const res = await copyUserRole(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { userRoleName: string }
  >({
    mutationFn: async (payload) => {
      const res = await updateUserRole(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
}

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

export const useAllCountries = (enabled = true) =>
  useQuery({
    queryKey: ["allCountry"],
    queryFn: async () => {
      const res = await fetchAllCountry();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useFetchStatesByCountry = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { countryId: number } // Payload Type
  >({
    mutationFn: async (payload) => {
      const res = await fetchStatesByCountry(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stateByCountry"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useFetchCitiesByState = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { stateId: number } // Payload Type
  >({
    mutationFn: async (payload) => {
      const res = await fetchCitiesByState(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cityByState"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};



