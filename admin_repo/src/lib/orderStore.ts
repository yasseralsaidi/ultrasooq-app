import { create } from "zustand";

export type State = {
  orders: {
    guestUser?: {
      firstName: string;
      lastName: string;
      email: string;
      cc: string;
      phoneNumber: string;
    };
    cartIds: number[];
    firstName: string;
    lastName: string;
    email: string;
    cc: string;
    phone: string;
    billingAddress?: string;
    billingCity?: string;
    billingProvince?: string;
    billingCountry?: string;
    billingPostCode?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingProvince?: string;
    shippingCountry?: string;
    shippingPostCode?: string;
  };
};

export type Actions = {
  setOrders: (data: State["orders"]) => void;
};

export const initialOrderState: State = {
  orders: {
    guestUser: undefined,
    cartIds: [],
    firstName: "",
    lastName: "",
    email: "",
    cc: "",
    phone: "",
    billingAddress: "",
    billingCity: "",
    billingProvince: "",
    billingCountry: "",
    billingPostCode: "",
    shippingAddress: "",
    shippingCity: "",
    shippingProvince: "",
    shippingCountry: "",
    shippingPostCode: "",
  },
};

export const useOrderStore = create<State & Actions>()((set) => ({
  orders: initialOrderState.orders,
  setOrders: (data) => set((state) => ({ ...state, orders: data })),
}));
