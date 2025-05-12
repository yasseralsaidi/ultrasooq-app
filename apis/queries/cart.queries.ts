import { APIResponseError } from "@/utils/types/common.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  addServiceToCartWithProduct,
  deleteCartItem,
  deleteServiceFromCart,
  fetchCartByDevice,
  fetchCartByUserId,
  fetchCartCountByDeviceId,
  fetchCartCountWithLogin,
  updateCartByDevice,
  updateCartWithLogin,
  updateCartWithService,
  updateUserCartByDeviceId,
} from "../requests/cart.requests";

export const useCartListByUserId = (
  payload: {
    page: number;
    limit: number;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: ["cart-by-user", payload],
    queryFn: async () => {
      const res = await fetchCartByUserId(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useCartListByDevice = (
  payload: {
    page: number;
    limit: number;
    deviceId: string;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: ["cart-by-device", payload],
    queryFn: async () => {
      const res = await fetchCartByDevice(payload);
      return res.data;
    },
    // onError: (err: APIResponseError) => {
    //   console.log(err);
    // },
    enabled,
  });

export const useUpdateCartWithLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { 
      productPriceId: number; 
      quantity: number, 
      sharedLinkId?: number; 
      productVariant?: any;
    }
  >({
    mutationFn: async (payload) => {
      const res = await updateCartWithLogin(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-with-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateCartByDevice = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { 
      productPriceId: number; 
      quantity: number; 
      deviceId: string, 
      sharedLinkId?: number; 
      productVariant?: any;
    }
  >({
    mutationFn: async (payload) => {
      const res = await updateCartByDevice(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-device"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-without-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateCartWithService = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; success: boolean },
    APIResponseError,
    {
      productId: number; 
      productPriceId: number; 
      quantity: number, 
      productVariant?: any;
      cartId: number;
      serviceId: number;
    }
  >({
    mutationFn: async (payload) => {
      const res = await updateCartWithService({
        ...payload,
        ...{ relatedCartType: 'PRODUCT', cartType: 'SERVICE' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-with-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { cartId: number }
  >({
    mutationFn: async (payload) => {
      const res = await deleteCartItem(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-by-device"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-with-login"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-without-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useDeleteServiceFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { cartId: number, serviceFeatureId?: number }
  >({
    mutationFn: async (payload) => {
      const res = await deleteServiceFromCart(payload.cartId, payload.serviceFeatureId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-by-device"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-with-login"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-without-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useUpdateUserCartByDeviceId = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; status: boolean },
    APIResponseError,
    { deviceId: string }
  >({
    mutationFn: async (payload) => {
      const res = await updateUserCartByDeviceId(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-without-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};

export const useCartCountWithLogin = (enabled = true) => {
  return useQuery({
    queryKey: ["cart-count-with-login"],
    queryFn: async () => {
      const res = await fetchCartCountWithLogin();
      return res.data;
    },
    enabled,
  });
};

export const useCartCountWithoutLogin = (
  payload: { deviceId: string },
  enabled = true,
) => {
  return useQuery({
    queryKey: ["cart-count-without-login"],
    queryFn: async () => {
      const res = await fetchCartCountByDeviceId(payload);
      return res.data;
    },
    enabled,
  });
};

export const useAddServiceToCartWithProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { data: any; message: string; success: boolean },
    APIResponseError,
    {[key: string]: any}
  >({
    mutationFn: async (payload) => {
      const res = await addServiceToCartWithProduct(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart-by-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-by-device"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-with-login"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cart-count-without-login"],
      });
    },
    onError: (err: APIResponseError) => {
      console.log(err);
    },
  });
};
