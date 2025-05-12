import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFees, connectFeeToCategories, deleteFees, fetchAllFees, fetchOneFees, updateFees } from "../requests/fees.requests";

export const useGetAllFees = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["getAllFees", query],
        queryFn: async () => {
            const res = await fetchAllFees(query); // Pass page and limit to fetchBrands
            return res.data;
        },
        enabled,
    });

export const useGetOneFees = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            //   console.log("payload2", payload);
            const res = await fetchOneFees(payload);
            return res.data;
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({
            //     queryKey: ["getAllFees"],
            // });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useAddFees = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            //   console.log("payload2", payload);
            const res = await addFees(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getAllFees"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useUpdateFees = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            //   console.log("payload2", payload);
            const res = await updateFees(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getAllFees"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useDeleteFees = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await deleteFees(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getAllFees"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useConnectFeeToCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await connectFeeToCategories(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getAllFees"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
}