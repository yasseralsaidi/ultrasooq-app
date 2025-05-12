import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRole, fetchPermissions, fetchRole, fetchRoles, setRolePermissions, updateRole } from "../requests/roles.requests";

export const useRoles = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["roles", query],
        queryFn: async () => {
            const res = await fetchRoles(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useRole = (roleId: number, enabled = true) =>
    useQuery({
        queryKey: ["role", roleId],
        queryFn: async () => {
            const res = await fetchRole(roleId);
            return res.data;
        },
        enabled,
    });

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await createRole(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await updateRole(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["roles"],
            });
        },
        onError: (err) => {
            console.log(err);
        },
    });
};

export const usePermissions = (query: any, enabled = true) =>
    useQuery({
        queryKey: ["permissions", query],
        queryFn: async () => {
            const res = await fetchPermissions(query); // Pass page and limit
            return res.data;
        },
        enabled,
    });

export const useSetRolePermissions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await setRolePermissions(payload);
            return res.data;
        },
        onSuccess: () => {
            
        },
        onError: (err) => {
            console.log(err);
        },
    });
};