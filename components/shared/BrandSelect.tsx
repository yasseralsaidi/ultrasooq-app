import { useBrands, useCreateBrand } from "@/apis/queries/masters.queries";
import { IBrands, IOption } from "@/utils/types/common.types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useToast } from "../ui/use-toast";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select/dist/declarations/src/Select";
import ReactSelect, { GroupBase } from "react-select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react"; // Using Lucide React icons
import { useTranslations } from "next-intl";

const customStyles = {
  control: (base: any) => ({ ...base, height: 48, minHeight: 48 }),
};

const ReactSelectInput: React.FC<{
  selectedProductType?: string
}> = ({
  // Set default product type as "OWNBRAND"
  selectedProductType = "OWNBRAND"
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const formContext = useFormContext();
  const { toast } = useToast();
  const [, setValue] = useState<IOption | null>();

  const [productType, setProductType] = useState<string>(selectedProductType);

  const { user } = useAuth();

  const brandsQuery = useBrands({ addedBy: user?.id, type: productType });
  const createBrand = useCreateBrand();

  const memoizedBrands = useMemo(() => {
    return productType
      ? brandsQuery?.data?.data.map((item: IBrands) => ({
          label: item.brandName,
          value: item.id,
        })) || []
      : [];
  }, [brandsQuery?.data?.data, productType]);

  // Set default product type in the form
  useEffect(() => {
    if (selectedProductType) {
      formContext.setValue("typeOfProduct", selectedProductType);
      setProductType(selectedProductType);
    }
  }, [selectedProductType]);

  const handleCreate = async (inputValue: string) => {
    const response = await createBrand.mutateAsync({ brandName: inputValue });

    if (response.status && response.data) {
      toast({
        title: t("brand_create_successful"),
        description: response.message,
        variant: "success",
      });
      setValue({ label: response.data.brandName, value: response.data.id });
      formContext.setValue("brandId", response.data.id);
    } else {
      toast({
        title: t("brand_create_failed"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  const brandType = [
    { label: t("brand"), value: "BRAND" },
    { label: t("spare_part"), value: "SPAREPART" },
    { label: t("own_brand"), value: "OWNBRAND" },
  ];

  const brandSelect = useRef<Select<any, false, GroupBase<any>>>(null);

  return (
    <>
      <div className="mt-2 flex flex-col gap-y-3">
        <Label dir={langDir} translate="no">{t("product_type")}</Label>
        <Controller
          name="typeOfProduct"
          control={formContext.control}
          render={({ field }) => (
            <ReactSelect
              // {...field}
              options={brandType}
              value={brandType.find(
                (item: IOption) => item.value === field.value,
              )}
              styles={customStyles}
              instanceId="typeOfProduct"
              onChange={(newValue) => {
                field.onChange(newValue?.value);
                if (newValue?.value) {
                  setProductType(newValue?.value);
                  if (brandSelect.current) {
                    brandSelect?.current?.clearValue();
                  }
                }
              }}
              placeholder={t("select")}
            />
          )}
        />
        <p className="text-[13px] text-red-500" dir={langDir}>
          {formContext.formState.errors["typeOfProduct"]?.message as string}
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-y-3">
        <div className="flex w-full items-center gap-1.5">
          <Label dir={langDir} translate="no">{t("brand")}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-pointer text-gray-500" />
              </TooltipTrigger>
              <TooltipContent side="right" dir={langDir} translate="no">
                {t("brand_input_info")}{" "}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="brandId"
          control={formContext.control}
          render={({ field }) => (
            <CreatableSelect
              // {...field}
              name={field.name}
              ref={brandSelect}
              isClearable
              isDisabled={createBrand.isPending}
              isLoading={createBrand.isPending}
              onChange={(newValue) => {
                field.onChange(newValue?.value);
                setValue(newValue);
              }}
              onCreateOption={handleCreate}
              options={memoizedBrands}
              value={memoizedBrands.find(
                (item: IOption) => item.value === field.value,
              )}
              styles={customStyles}
              instanceId="brandId"
              placeholder={t("select")}
            />
          )}
        />
        <p className="text-[13px] text-red-500" dir={langDir}>
          {formContext.formState.errors["brandId"]?.message as string}
        </p>
      </div>
    </>
  );
};

export default ReactSelectInput;
