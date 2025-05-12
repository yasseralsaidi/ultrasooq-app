import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APIResponseError } from "@/utils/types/common.types";
import {
  addQuestion,
  fetchQuestions,
  updateAnswer,
} from "../requests/question.requests";

export const useQuestions = (
  payload: {
    page: number;
    limit: number;
    productId: string;
    sortType?: "newest" | "oldest";
    userType?: string;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: ["questions", payload],
    queryFn: async () => {
      const res = await fetchQuestions(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useAddQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { productId: number; question: string }
  >({
    mutationFn: async (payload) => {
      const res = await addQuestion(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { productQuestionId: number; answer: string }
  >({
    mutationFn: async (payload) => {
      const res = await updateAnswer(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};
