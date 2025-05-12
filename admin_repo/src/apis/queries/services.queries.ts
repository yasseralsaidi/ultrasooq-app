import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllServices, fetchServiceById } from "../requests/services.requests";

export const useAllServices = (query: any, enabled = true) =>
  useQuery({
    queryKey: ["all-services", query],
    queryFn: async () => {
      const res = await fetchAllServices(query);
      return res.data;
    },
    enabled,
  });
  export const useFetchServiceById = (id: number, enabled = true) =>
    useQuery({
      queryKey: ["service-by-id", id],
      queryFn: async () => {
        const res = await fetchServiceById({ serviceId: id });
        return res.data;
      },
      enabled,
    });
//   export const useCategoryProd = (categoryId?: string, enabled = true) =>
//     useQuery({
//       queryKey: ["prod-category", categoryId],
//       queryFn: async () => {
//         const res = await fetchCategoryProd({ categoryId });
//         return res.data;
//       },
//       // onError: (err: APIResponseError) => {
//       //   console.log(err);
//       // },
//       enabled,
//     });

// export const useDeleteProduct = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (productId) => {
//       const res = await deleteProduct(productId);
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["all-products"],
//       });
//     },
//     onError: (err) => {
//       console.log(err);
//     },
//   });
// };



// export const useUpdateProduct = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (payload: { productId: string; status: string }) => {
//       const res = await updateProduct(payload);
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["all-products"],
//       });
//     },
//     onError: (err) => {
//       console.log(err);
//     },
//   });
// };
