import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, fetchTags } from "../requests/tags.requests";
import { APIResponseError } from "@/utils/types/common.types";

export const useTags = (enabled = true) =>
  useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetchTags();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { tagName: string }
  >({
    mutationFn: async (payload) => {
      const res = await createTag(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};
