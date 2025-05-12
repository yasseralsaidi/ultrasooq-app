export interface CartItem {
  id: number;
  cartType: "DEFAULT" | "SERVICE"
  productId: number;
  productPriceId: number;
  productPriceDetails: {
    adminId: number;
    offerPrice: string;
    productPrice_product: {
      productName: string;
      offerPrice: string;
      productImages: { id: number; image: string }[];
    };
    consumerDiscount: number;
    consumerDiscountType?: string;
    vendorDiscount: number;
    vendorDiscountType?: string;
    minQuantityPerCustomer?: number;
    maxQuantityPerCustomer?: number;
  };
  serviceId: number;
  cartServiceFeatures: any[];
  quantity: number;
  object: any;
}
