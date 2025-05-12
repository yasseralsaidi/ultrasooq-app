import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTransactionById, fetchTransactions } from "../requests/transactions.requests";

export const useTransactions = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["transactions", query],
        queryFn: async () => {
            const res = await fetchTransactions(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useFetchTranscationById = (id: number, enabled = true) =>
    useQuery({
        queryKey: ["transaction-by-id", id],
        queryFn: async () => {
            const res = await fetchTransactionById({ transactionId: id });
            return res.data;
        },
        enabled,
    });