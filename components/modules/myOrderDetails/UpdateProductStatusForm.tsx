import React, { useEffect, useMemo } from "react";
// import ControlledSelectInput from "@/components/shared/Forms/ControlledSelectInput";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import {
  useUpdateCancelReason,
  useUpdateProductStatus,
} from "@/apis/queries/orders.queries";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { STATUS_LIST } from "@/utils/constants";
import ControlledTextareaInput from "@/components/shared/Forms/ControlledTextareaInput";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

type UpdateProductStatusFormProps = {
  orderProductId: string;
  onClose: () => void;
  orderProductStatus?: string;
};

const formSchema = z
  .object({
    status: z
      .string()
      .trim()
      .min(2, { message: "Status is required" })
      .max(50, { message: "Status must be less than 50 characters" }),
    cancelReason: z.string().trim().optional(),
  })
  .superRefine(({ status, cancelReason }, ctx) => {
    if (status === "CANCELLED" && !cancelReason) {
      ctx.addIssue({
        code: "custom",
        message: "Cancel Reason is required",
        path: ["cancelReason"],
      });
    }
  });

const UpdateProductStatusForm: React.FC<UpdateProductStatusFormProps> = ({
  orderProductId,
  onClose,
  orderProductStatus,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "",
    },
  });

  const updateProductStatusQuery = useUpdateProductStatus();
  const updateCancelReason = useUpdateCancelReason();

  const watchStatus = form.watch("status");
  console.log(form.formState.errors);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log({
      orderProductId,
      status: values.status,
      cancelReason: values.cancelReason,
    });
    // return;
    if (values.status === "") return;

    const updatedData = {
      orderProductId: Number(orderProductId),
      status: values.status,
    };
    const response = await updateProductStatusQuery.mutateAsync(updatedData, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["order-by-seller-id", { orderProductId }],
        });
      },
    });

    if (response.status) {
      toast({
        title: t("status_update_successful"),
        description: response.message,
        variant: "success",
      });
      if (values.status !== "CANCELLED") {
        form.reset();
        onClose();
      }
    } else {
      toast({
        title: t("status_update_failed"),
        description: response.message,
        variant: "danger",
      });
    }
    if (values.status === "CANCELLED") {
      const response = await updateCancelReason.mutateAsync(
        {
          orderProductId: Number(orderProductId),
          cancelReason: values.cancelReason ? values.cancelReason : "",
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["order-by-seller-id", { orderProductId }],
            });
          },
        },
      );

      if (response.status) {
        toast({
          title: t("cancel_reason_updated"),
          description: t("cancelled_successfully"),
          variant: "success",
        });
        form.reset();
        onClose();
      } else {
        toast({
          title: t("cancel_reason_update_failed"),
          description: t("cancelation_failed"),
          variant: "danger",
        });
      }
    }
  };

  const formattedStatusList = useMemo(
    () =>
      STATUS_LIST.map((item) => ({
        label: item.label,
        value: item.value,
        disabled:
          orderProductStatus === "SHIPPED" && item.value === "CONFIRMED"
            ? true
            : (orderProductStatus === "OFD" && item.value === "SHIPPED") ||
                (orderProductStatus === "OFD" && item.value === "CONFIRMED")
              ? true
              : (orderProductStatus === "DELIVERED" && item.value === "OFD") ||
                  (orderProductStatus === "DELIVERED" &&
                    item.value === "SHIPPED") ||
                  (orderProductStatus === "DELIVERED" &&
                    item.value === "CONFIRMED")
                ? true
                : (orderProductStatus === "CANCELLED" &&
                      item.value === "DELIVERED") ||
                    (orderProductStatus === "CANCELLED" &&
                      item.value === "OFD") ||
                    (orderProductStatus === "CANCELLED" &&
                      item.value === "SHIPPED") ||
                    (orderProductStatus === "CANCELLED" &&
                      item.value === "CONFIRMED")
                  ? true
                  : false,
      })),
    [orderProductStatus],
  );

  useEffect(() => {
    if (orderProductStatus) {
      console.log(orderProductStatus);
      form.reset({
        status: orderProductStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderProductStatus]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="modal-body">
          {/* <ControlledSelectInput
            label="Status"
            name="status"
            options={STATUS_LIST}
          /> */}
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <select
                {...field}
                className="custom-form-control-s1 select1"
                name="status"
              >
                <option value="">Select Status</option>
                {(formattedStatusList || []).map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            )}
          />
          <p className="text-[13px] text-red-500" dir={langDir}>
            {form.formState.errors.status?.message}
          </p>
          <div className="mb-4"></div>
          {watchStatus === "CANCELLED" ? (
            <ControlledTextareaInput
              label="Cancel Reason"
              name="cancelReason"
            />
          ) : null}
        </div>
        <div className="modal-footer">
          <button type="submit" className="theme-primary-btn submit-btn" dir={langDir} translate="no">
            {t("save")}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateProductStatusForm;
