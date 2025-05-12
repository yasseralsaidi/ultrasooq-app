import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrderById, fetchOrderProducts, fetchOrders } from "../requests/orders.requests";

export const useOrders = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["orders", query],
        queryFn: async () => {
            const res = await fetchOrders(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useFetchOrderById = (id: number, enabled = true) =>
    useQuery({
        queryKey: ["order-by-id", id],
        queryFn: async () => {
            const res = await fetchOrderById({ orderId: id });
            return res.data;
        },
        enabled,
    });

export const useFetchOrderProducts = (id: number, payload: any, enabled = true) =>
    useQuery({
        queryKey: ["order-products-by-id", id],
        queryFn: async () => {
            const res = await fetchOrderProducts(Object.assign({ orderId: id }, payload));
            return res.data;
        },
        enabled,
    });