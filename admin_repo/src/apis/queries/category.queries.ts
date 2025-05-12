import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignMultipleCategory,
  createMultipleCategory,
  deleteCategory,
  fetchCategories,
  fetchProductCategories,
  fetchCategoriesassign,
  fetchCategory,
  fetchCategoryById,
  fetchSubCategoriesById,
  fetchdCategoriesassign,
  updateCategory,
  updateWhiteBlackList,
  fetchChildrenCategories,
} from "../requests/category.requests";

export const useCategories = (enabled = true) =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetchCategories();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useProductCategories = (enabled = true) =>
  useQuery({
    queryKey: ["productCategories"],
    queryFn: async () => {
      const res = await fetchProductCategories();
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useChildrenCategories = (categotyId: number, enabled = true) =>
  useQuery({
    queryKey: ["childrenCategories", categotyId],
    queryFn: async () => {
      const res = await fetchChildrenCategories(categotyId);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const Userassigncategoryformlist = (query: any, enabled = true) =>
  useQuery({
    queryKey: ["userlist", query],
    queryFn: async () => {
      const res = await fetchCategoriesassign(query); // Pass page and limit
      return res.data;
    },
    enabled,
  });

export const useCategoryById = (categoryId: string, enabled = true) =>
  useQuery({
    queryKey: ["category-by-id", categoryId],
    queryFn: async () => {
      const res = await fetchCategoryById({ categoryId });
      return res.data;
    },
    // onError: (err) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useCreateMultipleCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      parentId: number;
      menuId: number;
      type: string;
      categoryList: { name: string }[];
    }) => {
      const res = await createMultipleCategory(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useAssignMultipleCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { categoryIdList: any[] }) => {
      const res = await assignMultipleCategory(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useMultipleCategoryById = () => {
  const queryClient = useQueryClient();
  return useMutation<
    {
      data: any;
    },
    {},
    { categoryId: number }
  >({
    mutationFn: async (payload: { categoryId: number }) => {
      const res = await fetchdCategoriesassign(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["multi-categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      categoryId: string;
      name: string;
      icon?: string;
    }) => {
      const res = await updateCategory(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await deleteCategory(categoryId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useUpdateWhiteBlackList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {}) => {
      const res = await updateWhiteBlackList(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};

export const useCategory = (enabled = true) =>
  useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetchCategory();
      return res.data;
    },
    enabled,
  });

export const useSubCategoryById = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["sub-category-by-id", id],
    queryFn: async () => {
      const res = await fetchSubCategoriesById({ categoryId: id });
      return res.data;
    },
    enabled,
  });
