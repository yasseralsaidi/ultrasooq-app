import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllDynamicForms,
  createDynamicForm,
  fetchDynamicFormByID,
  updateDynamicForm,
  removeDynamicForm,
} from "../requests/dynamicForm.requests";

export const useAllDynamicForms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { page: number; limit: number }) => {
      const res = await fetchAllDynamicForms(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-forms"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useGetDynamicFormByID = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number | null }) => {
      const res = await fetchDynamicFormByID(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-forms"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useCreateDynamicForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {}) => {
      const res = await createDynamicForm(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-forms"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useUpdateDynamicForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {}) => {
      const res = await updateDynamicForm(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-forms"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useRemoveDynamicForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string }) => {
      const res = await removeDynamicForm(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-forms"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
