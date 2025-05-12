import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHelpCenterQueries, replyToQuery } from "../requests/help-center.requests";

export const HelpCenterQueries = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["helpCenterQueries", query],
        queryFn: async () => {
            const res = await fetchHelpCenterQueries(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useReplyToQuery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { helpCenterId: number, response: string; }) => {
            const res = await replyToQuery(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["helpCenterQueries"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};