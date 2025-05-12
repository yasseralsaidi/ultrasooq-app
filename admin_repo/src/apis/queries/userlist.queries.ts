import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateUserTradeRole, fetchUserslist } from "../requests/userlist.requests";

export const Userlist = (query: any, enabled = true) =>
  useQuery({
    queryKey: ["userlist", query],
    queryFn: async () => {
      const res = await fetchUserslist(query); // Pass page and limit
      return res.data;
    },
    enabled,
  });

export const useUpdateUserTradeRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await updateUserTradeRole(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userlist"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};