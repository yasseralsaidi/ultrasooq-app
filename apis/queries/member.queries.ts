import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { APIResponseError } from "@/utils/types/common.types";
import { createMember, fetchAllMembers, fetchPermissions, updateMember, setPermission, fetchPermissionByRoleId, updatePermission } from "../requests/member.requests";

export const useCreateMember = () => {
  const queryClient = useQueryClient();
    return useMutation<
      { data: any; message: string; status: boolean },
      APIResponseError
    >({
      mutationFn: async (payload) => {
        const res = await createMember(payload);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members"],
        });
      },
      onError: (err: APIResponseError) => {
        console.log(err);
      },
    });
  };

  export const useUpdateMember = () => {
    const queryClient = useQueryClient();
      return useMutation<
        { data: any; message: string; status: boolean },
        APIResponseError
      >({
        mutationFn: async (payload) => {
          const res = await updateMember(payload);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["members"],
          });
        },
        onError: (err: APIResponseError) => {
          console.log(err);
        },
      });
    };

  export const useAllMembers  = (payload: { page: number; limit: number;},enabled = true) =>
      useQuery({
        queryKey: ["members", payload],
        queryFn: async () => {
          const res = await fetchAllMembers(payload);
          return res.data;
        },
        // onError: (err: APIResponseError) => {
        //   console.log(err);
        // },
        enabled,
  });

  export const usePermissions = (enabled = true) =>
    useQuery({
      queryKey: ["permissions"],
      queryFn: async () => {
        const res = await fetchPermissions();
        return res.data;
      },
      // onError: (err: APIResponseError) => {
      //   console.log(err);
      // },
      enabled,
    });

    export const useSetPermission = () => {
      const queryClient = useQueryClient();
      return useMutation<
        { data: any; message: string; status: boolean },
        APIResponseError
      >({
        mutationFn: async (payload) => {
          const res = await setPermission(payload);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["setPermission"],
          });
        },
        onError: (err: APIResponseError) => {
          console.log(err);
        },
      });
    };

    export const useGetPermission = (payload: { userRoleId: number},enabled = true) =>
          useQuery({
            queryKey: ["setPermission", payload],
            queryFn: async () => {
              const res = await fetchPermissionByRoleId(payload);
              return res.data;
            },
            // onError: (err: APIResponseError) => {
            //   console.log(err);
            // },
            enabled,
          });

  export const useUpdatePermission = () => {
    const queryClient = useQueryClient();
    return useMutation<
      { data: any; message: string; status: boolean },
      APIResponseError
    >({
      mutationFn: async (payload) => {
        const res = await updatePermission(payload);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["setPermission"],
        });
      },
      onError: (err: APIResponseError) => {
        console.log(err);
      },
    });
  };
        
    