import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMember, fetchMember, fetchMembers, updateMember } from "../requests/members.requests";

export const useMembers = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["members", query],
        queryFn: async () => {
            const res = await fetchMembers(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useMember = (memberId: number, enabled = true) =>
    useQuery({
        queryKey: ["member", memberId],
        queryFn: async () => {
            const res = await fetchMember(memberId);
            return res.data;
        },
        enabled,
    });


export const useCreateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await createMember(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["members"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await updateMember(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["members"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};