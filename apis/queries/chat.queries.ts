import { APIResponseError } from "../../utils/types/common.types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreatePrivateRoomRequest, RfqPriceStatusUpdateRequest } from "../../utils/types/chat.types";
import { createPrivateRoom, getProductDetails, updateRfqRequestPriceStatus, getProductMessages } from "../requests/chat.requests";

export const useCreatePrivateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean, id: string },
    APIResponseError,
    CreatePrivateRoomRequest
  >({
    mutationFn: async (payload) => {
      const res = await createPrivateRoom(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateRfqPriceRequestStatus = () => {
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    RfqPriceStatusUpdateRequest
  >({
    mutationFn: async (payload) => {
      const res = await updateRfqRequestPriceStatus(payload);
      return res.data;
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};


export const useGetProductDetails = (
  productId: number,
  enabled = true,
) =>
  useQuery({
    queryKey: ["productId", productId],
    queryFn: async () => {
      const res = await getProductDetails(productId);
      return res.data;
    },
    enabled,
  });