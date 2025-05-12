import { APIResponseError } from "@/utils/types/common.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHelpCenterQueries, submitQuery } from "../requests/help-center.requests";

export const useHelpCenterQueries = (
  payload: {
    page: number;
    limit: number;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: ["help_center_queries", payload],
    queryFn: async () => {
      const res = await fetchHelpCenterQueries(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useSubmitQuery = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { userId?: number; email: string; query: string; }
  >({
    mutationFn: async (payload) => {
      const res = await submitQuery(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["help_center_queries"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
}