import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PlaceholderImage from "@/public/images/product-placeholder.png";
import Image from "next/image";
import validator from "validator";
// import { cn } from "@/lib/utils";
import EditIcon from "@/public/images/edit-rfq.png";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoIosEyeOff, IoIosEye } from "react-icons/io";
import {
  useRemoveProduct,
  useUpdateProductStatus,
  useUpdateSingleProduct,
} from "@/apis/queries/product.queries";
import CounterTextInputField from "../createProduct/CounterTextInputField";
import { useToast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import AddProductContent from "../products/AddProductContent";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type ManageProductCardProps = {
  selectedIds?: number[];
  onSelectedId?: (args0: boolean | string, args1: number) => void;
  onSelect?: (data: { [key: string]: any }) => void;
  id: number;
  productId: number;
  status: string;
  askForPrice: string;
  askForStock: string;
  productImage: string | null;
  productName: string;
  productPrice: string;
  offerPrice: string;
  deliveryAfter: number;
  stock: number;
  consumerType: string;
  sellType: string;
  timeOpen: number | null;
  timeClose: number | null;
  vendorDiscount: number | null;
  vendorDiscountType: string | null;
  consumerDiscount: number | null;
  consumerDiscountType: string | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  minCustomer: number | null;
  maxCustomer: number | null;
  minQuantityPerCustomer: number | null;
  maxQuantityPerCustomer: number | null;
  productCondition: string;
  onRemove: (id: number) => void; // Ensure onRemove function is typed properly
};

const ManageProductCard: React.FC<ManageProductCardProps> = ({
  selectedIds,
  onSelectedId,
  onSelect,
  id,
  productId,
  status: initialStatus,
  askForPrice,
  askForStock,
  productImage,
  productName,
  productPrice: initialProductPrice,
  offerPrice: initialPrice,
  deliveryAfter: initialDelivery,
  stock: initialStock,
  consumerType: initialConsumerType,
  sellType: initialSellType,
  timeOpen: initialTimeOpen,
  timeClose: initialTimeClose,
  vendorDiscount: initialVendorDiscount,
  vendorDiscountType: initialVendorDiscountType,
  consumerDiscount: initialConsumerDiscount,
  consumerDiscountType: initialConsumerDiscountType,
  minQuantity: initialMinQuantity,
  maxQuantity: initialMaxQuantity,
  minCustomer: initialMinCustomer,
  maxCustomer: initialMaxCustomer,
  minQuantityPerCustomer: initialMinQuantityPerCustomer,
  maxQuantityPerCustomer: initialMaxQuantityPerCustomer,
  productCondition: initialCondition,
  onRemove,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const { toast } = useToast();

  // Status update part

  const [status, setStatus] = useState(initialStatus); // Local state for status
  const statusUpdate = useUpdateProductStatus(); // Get the mutation function

  const updateStatus = async (status: string) => {
    try {
      const newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await statusUpdate.mutateAsync({
        productPriceId: id,
        status: newStatus,
      });

      if (response.status) {
        setStatus(newStatus); // Update local state to reflect the new status
        toast({
          title: t("status_update_successful"),
          description: t("status_updated_successfully"),
          variant: "success",
        });
      } else {
        toast({
          title: t("status_update_failed"),
          description: t("something_went_wrong"),
          variant: "danger",
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_update_status"),
        variant: "danger",
      });
    }
  };

  // Stock manage part

  const [stock, setStock] = useState(initialStock);
  const decreaseStock = () => {
    setStock((prevStock) => Math.max(prevStock - 1, 0)); // Prevent going below 0
  };

  const increaseStock = () => {
    setStock((prevStock) => Math.min(prevStock + 1, 1000)); // Prevent exceeding 200
  };

  // Price  part

  const [offerPrice, setPrice] = useState<number>(Number(initialPrice)); // Ensure it's a number
  const [productPrice, setProductPrice] = useState<number>(
    Number(initialProductPrice),
  ); // Ensure it's a number
  const decreasePrice = () => {
    setPrice((prevPrice) => Math.max(Number(prevPrice) - 1, 0)); // Convert prevPrice to number before subtracting
    setProductPrice((prevPrice) => Math.max(Number(prevPrice) - 1, 0)); // Convert prevPrice to number before subtracting
  };

  const increasePrice = () => {
    setPrice((prevPrice) => Math.min(prevPrice + 1, 1000000)); // Prevent exceeding 200
    setProductPrice((prevPrice) => Math.min(prevPrice + 1, 1000000)); // Prevent exceeding 200
  };

  // Product condition part && customer type && sell type

  const [productCondition, setCondition] = useState<string>(initialCondition);
  const [consumerType, setConsumer] = useState<string>(initialConsumerType);
  const [sellType, setSell] = useState<string>(initialSellType);

  // set Deliver After

  const [deliveryAfter, setDelivery] = useState<number>(
    Number(initialDelivery),
  ); // Ensure it's a number
  const decreaseDeliveryDay = () => {
    setDelivery((prevDay) => Math.max(Number(prevDay) - 1, 0)); // Convert prevPrice to number before subtracting
  };

  const increaseDeliveryDay = () => {
    setDelivery((prevDay) => Math.min(prevDay + 1, 50)); // Prevent exceeding 200
  };

  // set Time open & close

  const [timeOpen, setTimeOpen] = useState<number>(Number(initialTimeOpen));
  const decreaseTimeOpen = () => {
    setTimeOpen((prevDay) => Math.max(Number(prevDay) - 1, 0));
  };

  const increaseTimeOpen = () => {
    setTimeOpen((prevDay) => Math.min(prevDay + 1, 50));
  };

  const [timeClose, setTimeClose] = useState<number>(Number(initialTimeClose));
  const decreaseTimeClose = () => {
    setTimeClose((prevDay) => Math.max(Number(prevDay) - 1, 0));
  };

  const increaseTimeClose = () => {
    setTimeClose((prevDay) => Math.min(prevDay + 1, 50));
  };

  //  Remaining part

  const [vendorDiscount, setVendor] = useState<number>(
    Number(initialVendorDiscount),
  );
  const decreaseVendorDiscount = () => {
    setVendor((prevDayDiscount) => Math.max(Number(prevDayDiscount) - 1, 0));
  };

  const increaseVendorDiscount = () => {
    setVendor((prevDayDiscount) => Math.min(prevDayDiscount + 1, 50));
  };

  const [vendorDiscountType, setVendorDiscountType] = useState<string | null>(
    initialVendorDiscountType,
  );

  const [consumerDiscount, setConsumerDiscount] = useState<number>(
    Number(initialConsumerDiscount),
  );
  const decreaseConsumerDiscount = () => {
    setConsumerDiscount((prevDayDiscount) =>
      Math.max(Number(prevDayDiscount) - 1, 0),
    );
  };

  const increaseConsumerDiscount = () => {
    setConsumerDiscount((prevDayDiscount) => Math.min(prevDayDiscount + 1, 50));
  };

  const [consumerDiscountType, setConsumerDiscountType] = useState<
    string | null
  >(initialConsumerDiscountType);

  const [minQuantity, setMinQuantity] = useState<number>(
    Number(initialMinQuantity),
  );
  const decreaseMinQuantity = () => {
    setMinQuantity((prevDayQuantity) =>
      Math.max(Number(prevDayQuantity) - 1, 0),
    );
  };

  const increaseMinQuantity = () => {
    setMinQuantity((prevDayQuantity) => Math.min(prevDayQuantity + 1, 50));
  };

  const [maxQuantity, setMaxQuantity] = useState<number>(
    Number(initialMaxQuantity),
  );
  const decreaseMaxQuantity = () => {
    setMaxQuantity((prevDayQuantity) =>
      Math.max(Number(prevDayQuantity) - 1, 0),
    );
  };

  const increaseMaxsQuantity = () => {
    setMaxQuantity((prevDayQuantity) => Math.min(prevDayQuantity + 1, 50));
  };

  const [minCustomer, setMinCustomer] = useState<number>(
    Number(initialMinCustomer),
  );
  const decreaseMinCustomer = () => {
    setMinCustomer((prevCustomer) => Math.max(Number(prevCustomer) - 1, 0));
  };

  const increaseMinsCustomer = () => {
    setMinCustomer((prevCustomer) => Math.min(prevCustomer + 1, 50));
  };

  const [maxCustomer, setMaxCustomer] = useState<number>(
    Number(initialMaxCustomer),
  );
  const decreaseMaxCustomer = () => {
    setMaxCustomer((prevCustomer) => Math.max(Number(prevCustomer) - 1, 0));
  };

  const increaseMaxsCustomer = () => {
    setMaxCustomer((prevCustomer) => Math.min(prevCustomer + 1, 50));
  };

  const [minQuantityPerCustomer, setMinQuantityCustomer] = useState<number>(
    Number(initialMinQuantityPerCustomer),
  );
  const decreaseMinQuantityCustomer = () => {
    setMinQuantityCustomer((prevDayQuantity) =>
      Math.max(Number(prevDayQuantity) - 1, 0),
    );
  };

  const increaseMinQuantityCustomer = () => {
    setMinQuantityCustomer((prevDayQuantity) =>
      Math.min(prevDayQuantity + 1, 50),
    );
  };

  const [maxQuantityPerCustomer, setMaxQuantityCustomer] = useState<number>(
    Number(initialMaxQuantityPerCustomer),
  );
  const decreaseMaxQuantityCustomer = () => {
    setMaxQuantityCustomer((prevDayQuantity) =>
      Math.max(Number(prevDayQuantity) - 1, 0),
    );
  };

  const increaseMaxQuantityCustomer = () => {
    setMaxQuantityCustomer((prevDayQuantity) =>
      Math.min(prevDayQuantity + 1, 50),
    );
  };

  // call update single product

  const productUpdate = useUpdateSingleProduct(); // Get the mutation function

  const handleUpdate = async () => {
    try {
      const response = await productUpdate.mutateAsync({
        productPriceId: id,
        stock,
        askForPrice,
        askForStock,
        offerPrice,
        productPrice,
        status,
        productCondition,
        consumerType,
        sellType,
        deliveryAfter,
        timeOpen,
        timeClose,
        vendorDiscount,
        vendorDiscountType,
        consumerDiscount,
        consumerDiscountType,
        minQuantity,
        maxQuantity,
        minCustomer,
        maxCustomer,
        minQuantityPerCustomer,
        maxQuantityPerCustomer,
      });

      if (response.status) {
        toast({
          title: t("product_update_successful"),
          description: t("product_updated_successfully"),
          variant: "success",
        });
      } else {
        toast({
          title: t("product_update_failed"),
          description: t("something_went_wrong"),
          variant: "danger",
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_update_product"),
        variant: "danger",
      });
    }
  };

  // For Add new product
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleAddProductModal = () =>
    setIsAddProductModalOpen(!isAddProductModalOpen);

  // For remove product
  const productRemove = useRemoveProduct(); // Get the mutation function
  const handleRemoveProduct = async () => {
    try {
      const response = await productRemove.mutateAsync({
        productPriceId: id,
      });

      if (response.status) {
        toast({
          title: t("product_removed"),
          description: t("product_removed_successfully"),
          variant: "success",
        });
        // Call the function to remove the product from the UI
        onRemove(id);
      } else {
        toast({
          title: t("product_removed"),
          description: t("something_went_wrong"),
          variant: "danger",
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_to_remove_product"),
        variant: "danger",
      });
    }
  };

  // Function to reset all values to initial state
  const handleReset = () => {
    setStock(initialStock);
    setPrice(Number(initialPrice));
    setDelivery(Number(initialDelivery));
    setConsumer(initialConsumerType);
    setSell(initialSellType);
    setCondition(initialCondition);
    setTimeOpen(Number(initialTimeOpen));
    setTimeClose(Number(initialTimeClose));
    setVendor(Number(initialVendorDiscount));
    setConsumerDiscount(Number(initialConsumerDiscount));
    setMinQuantity(Number(initialMinQuantity));
    setMaxQuantity(Number(initialMaxQuantity));
    setMinCustomer(Number(initialMinCustomer));
    setMaxCustomer(Number(initialMaxCustomer));
    setMinQuantityCustomer(Number(initialMinQuantityPerCustomer));
    setMaxQuantityCustomer(Number(initialMaxQuantityPerCustomer));
  };

  return (
    <>
      <div className="existing-product-add-item">
        <div className="existing-product-add-box">
          <div className="existing-product-add-box-row">
            <div className="leftdiv">
              <div className="image-container">
                <div className="existing_product_checkbox z-10">
                  <Checkbox
                    className="border border-solid border-gray-300 data-[state=checked]:!bg-dark-orange"
                    checked={selectedIds?.includes(id)}
                    onCheckedChange={(checked) => {
                      onSelectedId?.(checked, id);
                      if (checked) {
                        onSelect?.({
                          stock,
                          askForPrice,
                          askForStock,
                          offerPrice,
                          productPrice,
                          status,
                          productCondition,
                          consumerType,
                          sellType,
                          deliveryAfter,
                          timeOpen,
                          timeClose,
                          vendorDiscount,
                          vendorDiscountType,
                          consumerDiscount,
                          consumerDiscountType,
                          minQuantity,
                          maxQuantity,
                          minCustomer,
                          maxCustomer,
                          minQuantityPerCustomer,
                          maxQuantityPerCustomer,
                        });
                      }
                    }}
                  />
                </div>
                <div
                  className="existing_product_checkbox left-[30px] z-10 text-[20px] text-gray-500"
                  onClick={() => updateStatus(status)} // Pass function reference correctly
                >
                  {status === "ACTIVE" ? <IoIosEye /> : <IoIosEyeOff />}
                </div>
                <div className="relative mx-auto h-[100%] w-[100%]">
                  <Image
                    src={
                      productImage && validator.isURL(productImage)
                        ? productImage
                        : PlaceholderImage
                    }
                    alt="product-image"
                    fill
                    sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
                    className="object-contain"
                    blurDataURL="/images/product-placeholder.png"
                    placeholder="blur"
                  />
                </div>
                {productCondition === "OLD" ? (
                  <div className="absolute right-0 top-0 z-10">
                    <Link href={`/product/${productId}?productPriceId=${id}`}>
                      <Image
                        src={EditIcon}
                        alt="review-dot-icon"
                        height={21}
                        width={21}
                      />
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="text-container">
                <h3>{productName || "-"}</h3>
              </div>
              <div className="form-container">
                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  {/* For Stock */}
                  <div className="flex flex-wrap items-center gap-1 space-y-1 md:gap-0">
                    <div
                      className="flex items-center justify-start gap-2 text-black"
                      dir={langDir}
                    >
                      <input
                        type="checkbox"
                        className="h-[20px] w-[20px]"
                        defaultChecked={askForStock === "false"} // Checkbox is checked when askForStock is false
                      />
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("stock")}
                      </div>
                    </div>
                    {askForStock === "false" ? (
                      <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                        <a
                          href="javascript:void(0)"
                          className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc] disabled:text-[#999]"
                          onClick={decreaseStock}
                        >
                          -
                        </a>
                        <input
                          type="text"
                          value={stock}
                          className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                          onChange={(e) => setStock(Number(e.target.value))}
                          // readOnly // Prevent manual editing
                        />
                        <a
                          href="javascript:void(0)"
                          className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                          onClick={increaseStock}
                        >
                          +
                        </a>
                      </div>
                    ) : (
                      <div
                        className="text-left text-[13px] font-semibold leading-normal text-gray-500"
                        translate="no"
                      >
                        {t("ask_for_the_stock")}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 space-y-1 md:gap-0">
                    <div
                      className="flex items-center justify-start gap-2 text-black"
                      dir={langDir}
                    >
                      <input
                        type="checkbox"
                        className="h-[20px] w-[20px]"
                        defaultChecked={askForPrice === "false"} // Checkbox is checked when askForStock is false
                      />
                      <div
                        className="text-[12px] font-semibold"
                        dir={langDir}
                        translate="no"
                      >
                        {t("price")}
                      </div>
                    </div>
                    {askForStock === "false" ? (
                      <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                        <a
                          href="javascript:void(0)"
                          className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                          onClick={decreasePrice}
                        >
                          -
                        </a>
                        <input
                          type="text"
                          value={productPrice}
                          className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                          onChange={(e) =>
                            setProductPrice(Number(e.target.value))
                          }
                        />
                        <a
                          href="javascript:void(0)"
                          className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                          onClick={increasePrice}
                        >
                          +
                        </a>
                      </div>
                    ) : (
                      <div
                        className="text-left text-[13px] font-semibold leading-normal text-gray-500"
                        translate="no"
                      >
                        {t("ask_for_the_price")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("product_condition")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <select
                        className="m-0 w-[100%] text-center focus:border-none focus:outline-none"
                        defaultValue={initialCondition} // Bind the selected value to the state
                        onChange={(e) => setCondition(e.target.value)} // Update the state when the value changes
                      >
                        <option value={"NEW"} dir={langDir} translate="no">
                          {t("new")}
                        </option>
                        <option value={"OLD"} dir={langDir} translate="no">
                          {t("old")}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div
                        className="text-[12px] font-semibold"
                        dir={langDir}
                        translate="no"
                      >
                        {t("deliver_after")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseDeliveryDay}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={deliveryAfter}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setDelivery(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseDeliveryDay}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1">
                    <button
                      type="button"
                      className="flex h-[50px] w-full items-center justify-center border-none bg-[#5a82ca] text-[12px] text-white"
                      onClick={handleUpdate} // Attach the handleUpdate function here
                      translate="no"
                    >
                      {t("update")}
                    </button>
                  </div>
                  <div className="flex flex-wrap space-y-1">
                    <button
                      type="button"
                      className="flex h-[50px] w-full items-center justify-center border-none bg-[#5a82ca] text-[12px] text-white"
                      onClick={handleAddProductModal}
                      dir={langDir}
                      translate="no"
                    >
                      {t("add_new")}
                    </button>
                  </div>
                </div>
                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1">
                    <button
                      type="button"
                      className="flex h-[50px] w-full items-center justify-center border-none bg-[#d56d26] text-[12px] text-white"
                      onClick={handleReset}
                      dir={langDir}
                      translate="no"
                    >
                      {t("reset")}
                    </button>
                  </div>
                  <div className="flex flex-wrap space-y-1">
                    <button
                      type="button"
                      className="flex h-[50px] w-full items-center justify-center border-none bg-[#d56d26] text-[12px] text-white"
                      onClick={handleRemoveProduct}
                      dir={langDir}
                      translate="no"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="rightdiv">
              <div className="form-container">
                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("time_open")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseTimeOpen}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={timeOpen}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setTimeOpen(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseTimeOpen}
                      >
                        +
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div
                        className="text-[12px] font-semibold"
                        dir={langDir}
                        translate="no"
                      >
                        {t("time_close")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseTimeClose}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={timeClose}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setTimeClose(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseTimeClose}
                      >
                        +
                      </a>
                    </div>
                  </div>

                  {/* <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label>Time Open</label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{timeOpen || "-"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label>Time Close</label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{timeClose || "-"}</span>
                  </div>
                </div> */}
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex w-full items-center justify-start gap-2 text-black md:w-[40%]">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("consumer_type")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2 text-sm md:w-[60%]">
                      <select
                        className="m-0 w-[100%] text-center text-[12x] focus:border-none focus:outline-none"
                        defaultValue={initialConsumerType} // Bind the selected value to the state
                        onChange={(e) => setConsumer(e.target.value)} // Update the state when the value changes
                      >
                        <option value={"CONSUMER"} dir={langDir} translate="no">
                          {t("consumer")}
                        </option>
                        <option value={"VENDORS"} dir={langDir} translate="no">
                          {t("vendor")}
                        </option>
                        <option value={"EVERYONE"} dir={langDir} translate="no">
                          {t("everyone")}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Consumer Type
                  </label>
                  <span>{consumerType || "-"}</span>
                </div>
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Sell Type
                  </label>
                  <span>{sellType || "-"}</span>
                </div> */}
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex w-[40%] items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("sell_type")}
                      </div>
                    </div>
                    <div className="flex w-[60%] items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2 text-sm">
                      <select
                        className="m-0 w-[100%] text-center text-[12x] focus:border-none focus:outline-none"
                        defaultValue={initialSellType} // Bind the selected value to the state
                        onChange={(e) => setSell(e.target.value)} // Update the state when the value changes
                      >
                        <option
                          value={"NORMALSELL"}
                          dir={langDir}
                          translate="no"
                        >
                          {t("normal_sell")}
                        </option>
                        <option value={"BUYGROUP"} dir={langDir} translate="no">
                          {t("buy_group")}
                        </option>
                        <option value={"EVERYONE"} dir={langDir} translate="no">
                          {t("everyone")}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("vendor_discount")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseVendorDiscount}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={vendorDiscount}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setVendor(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseVendorDiscount}
                      >
                        +
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("consumer_discount")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseConsumerDiscount}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={consumerDiscount}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) =>
                          setConsumerDiscount(Number(e.target.value))
                        }
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseConsumerDiscount}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("min_quantity")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMinQuantity}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={minQuantity}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setMinQuantity(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMinQuantity}
                      >
                        +
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("max_quantity")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMaxQuantity}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={maxQuantity}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setMaxQuantity(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMaxsQuantity}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("min_customer")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMinCustomer}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={minCustomer}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setMinCustomer(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMinsCustomer}
                      >
                        +
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("max_customer")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMaxCustomer}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={maxCustomer}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) => setMaxCustomer(Number(e.target.value))}
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMaxsCustomer}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("min_quantity_per_customer")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMinQuantityCustomer}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={minQuantityPerCustomer}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) =>
                          setMinQuantityCustomer(Number(e.target.value))
                        }
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMinQuantityCustomer}
                      >
                        +
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap space-y-1" dir={langDir}>
                    <div className="flex items-center justify-start gap-2 text-black">
                      <div className="text-[12px] font-semibold" translate="no">
                        {t("max_quantity_per_customer")}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center rounded border-[1px] border-[#EBEBEB] border-[solid] p-2">
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold text-[#ccc]"
                        onClick={decreaseMaxQuantityCustomer}
                      >
                        -
                      </a>
                      <input
                        type="text"
                        value={maxQuantityPerCustomer}
                        className="m-0 w-[60%] text-center focus:border-none focus:outline-none"
                        onChange={(e) =>
                          setMaxQuantityCustomer(Number(e.target.value))
                        }
                      />
                      <a
                        href="javascript:void(0)"
                        className="m-0 w-[20%] text-[24px] font-semibold  text-[#ccc]"
                        onClick={increaseMaxQuantityCustomer}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>

                {/* <div className="mb-2 grid w-full grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2">
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Vendor Discount
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{vendorDiscount ? `${vendorDiscount}%` : "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Consumer Discount
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>
                      {consumerDiscount ? `${consumerDiscount}%` : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Min Quantity
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{minQuantity || "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Max Quantity
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{maxQuantity || "-"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Min Consumer
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{minCustomer || "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Max Consumer
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{maxCustomer || "-"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Min Qty Consumer
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{minQuantityPerCustomer || "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap space-y-1 rounded bg-[#f1f1f1] p-1">
                  <label className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Max Qty Consumer
                  </label>
                  <div className="theme-inputValue-picker-upDown">
                    <span>{maxQuantityPerCustomer || "-"}</span>
                  </div>
                </div>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddProductModalOpen} onOpenChange={handleAddProductModal}>
        <AddProductContent productId={productId} />
      </Dialog>
    </>
  );
};

export default ManageProductCard;
