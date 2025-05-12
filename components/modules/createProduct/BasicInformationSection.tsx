import React, { useEffect, useMemo, useRef, useState } from "react";
import AccordionMultiSelectV2 from "@/components/shared/AccordionMultiSelectV2";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
// import { useUploadFile } from "@/apis/queries/upload.queries";
import { v4 as uuidv4 } from "uuid";
import { ISelectOptions } from "@/utils/types/common.types";
import {
  // useCategories,
  useCategory,
  useSubCategoryById,
} from "@/apis/queries/category.queries";
import ControlledTextInput from "@/components/shared/Forms/ControlledTextInput";
import AddImageContent from "../profile/AddImageContent";
import CloseWhiteIcon from "@/public/images/close-white.svg";
import ReactPlayer from "react-player/lazy";
import BrandSelect from "@/components/shared/BrandSelect";
import { PRODUCT_CATEGORY_ID, PRODUCT_CONDITION_LIST } from "@/utils/constants";
import ReactSelect from "react-select";
import PriceSection from "./PriceSection";
import DescriptionSection from "./DescriptionSection";
import { isImage, isVideo } from "@/utils/helper";
import { useCreateTag } from "@/apis/queries/tags.queries";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const customStyles = {
  control: (base: any) => ({
    ...base,
    height: 48,
    minHeight: 48,
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 20,
  }),
};

type ProductImageProps = {
  path: string;
  id: string;
};

type BasicInformationProps = {
  tagsList: any;
  activeProductType?: string;
  selectedCategoryIds?: string[];
};

const BasicInformationSection: React.FC<BasicInformationProps> = ({
  tagsList,
  activeProductType,
  selectedCategoryIds,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const formContext = useFormContext();
  const { toast } = useToast();
  const photosRef = useRef<HTMLInputElement>(null);
  const createTag = useCreateTag();
  const [listIds, setListIds] = useState<string[]>([]);
  const [catList, setCatList] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string>(
    PRODUCT_CATEGORY_ID.toString(),
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // const upload = useUploadFile();
  const categoryQuery = useCategory("1");
  const subCategoryById = useSubCategoryById(currentId, !!currentId);

  const watchProductImages = formContext.watch("productImages");

  const memoizedCategories = useMemo(() => {
    return (
      categoryQuery?.data?.data?.children[0]?.children.map((item: any) => {
        return { label: item.name, value: item.id };
      }) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryQuery?.data?.data?.children?.length]);

  const handleEditPreviewImage = (id: string, item: FileList) => {
    const tempArr = watchProductImages || [];
    const filteredFormItem = tempArr.filter(
      (item: ProductImageProps) => item.id === id,
    );
    if (filteredFormItem.length) {
      filteredFormItem[0].path = item[0];
      formContext.setValue("productImages", [...tempArr]);
    }
  };

  const handleRemovePreviewImage = (id: string) => {
    formContext.setValue("productImages", [
      ...(watchProductImages || []).filter(
        (item: ProductImageProps) => item.id !== id,
      ),
    ]);
  };

  const handleCreateTag = async (tag: string) => {
    const response = await createTag.mutateAsync({ tagName: tag });

    if (response.status && response.data) {
      toast({
        title: t("tag_create_successful"),
        description: response.message,
        variant: "success",
      });
      catList.push({ value: response.data.id, label: response.data.tagName });
      let selected = formContext.getValues("productTagList") || [];
      selected.push({ value: response.data.id, label: response.data.tagName });
      formContext.setValue("productTagList", selected);
    } else {
      toast({
        title: t("tag_create_failed"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    if (catList[currentIndex]) {
      let tempList = catList;
      if (subCategoryById.data?.data?.children) {
        tempList[currentIndex] = subCategoryById.data?.data;
        tempList = tempList.slice(0, currentIndex + 1);
      }
      setCatList([...tempList]);
      return;
    }

    if (subCategoryById.data?.data?.children) {
      setCatList([...catList, subCategoryById.data?.data]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, subCategoryById.data?.data?.children, currentIndex]);

  useEffect(
    () => formContext.setValue("categoryId", Number(currentId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentId],
  );

  useEffect(() => {
    if (selectedCategoryIds?.length && catList?.length && !listIds.length) {
      setCurrentId(selectedCategoryIds[currentIndex]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      if (selectedCategoryIds.length == currentIndex + 1) {
        setListIds(selectedCategoryIds);
      }
    }
  }, [selectedCategoryIds, catList?.length]);

  useEffect(
    () => formContext.setValue("categoryLocation", listIds.join(",")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listIds?.length],
  );

  const productConditions = () => {
    return Object.keys(PRODUCT_CONDITION_LIST).map(
      (value: string, index: number) => {
        return {
          label: t(PRODUCT_CONDITION_LIST[index].label),
          value: PRODUCT_CONDITION_LIST[index].value,
        };
      },
    );
  };

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-x-5">
        <div className="col-span-4 mx-auto mb-3 w-full max-w-[950px] rounded-lg border border-solid border-gray-300 bg-white p-2 shadow-sm sm:p-3 lg:p-4">
          <div className="flex w-full flex-wrap">
            <div className=" w-full">
              <div className="flex flex-wrap">
                <div className="form-groups-common-sec-s1 product-form-groups-common-sec-s1">
                  <h3 dir={langDir} translate="no">
                    {t("basic_information")}
                  </h3>
                  <div className="mb-3 grid w-full grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
                    <div className="flex w-full flex-col justify-between gap-y-2">
                      <Label dir={langDir} translate="no">
                        {t("product_category")}
                      </Label>
                      <Controller
                        name="categoryId"
                        control={formContext.control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="!h-[48px] w-full rounded border !border-gray-300 px-3 text-sm focus-visible:!ring-0"
                            onChange={(e) => {
                              if (e.target.value === "") {
                                return;
                              }
                              setCurrentId(e.target.value);
                              setCurrentIndex(0);

                              if (listIds[0]) {
                                let tempIds = listIds;
                                tempIds[0] = e.target.value;
                                tempIds = tempIds.slice(0, 1);

                                setListIds([...tempIds]);
                                return;
                              }
                              setListIds([...listIds, e.target.value]);
                            }}
                            value={catList[0]?.id || ""}
                            disabled={true} // This makes the select field disabled
                          >
                            <option value="" dir={langDir} translate="no">
                              {t("select_category")}
                            </option>
                            {memoizedCategories.map((item: ISelectOptions) => (
                              <option
                                value={item.value?.toString()}
                                key={item.value}
                                dir={langDir}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      <p
                        className="text-[13px] font-medium text-red-500"
                        dir={langDir}
                      >
                        {
                          formContext.formState.errors["categoryId"]
                            ?.message as string
                        }
                      </p>
                    </div>

                    {catList.length > 0
                      ? catList
                          .filter((item) => item.children?.length)
                          .map((item, index) => (
                            <div
                              key={item?.id}
                              className="mb-3 grid w-full grid-cols-1 gap-x-5 gap-y-3"
                            >
                              <div className="flex w-full flex-col justify-between gap-y-2">
                                <Label dir={langDir} translate="no">
                                  {t("sub_category")}
                                </Label>
                                <select
                                  className="!h-[48px] w-full rounded border !border-gray-300 px-3 text-sm focus-visible:!ring-0"
                                  onChange={(e) => {
                                    if (e.target.value === "") {
                                      return;
                                    }

                                    setCurrentId(e.target.value);
                                    setCurrentIndex(index + 1);

                                    if (listIds[index]) {
                                      let tempIds = listIds;
                                      tempIds[index] = e.target.value;
                                      tempIds = tempIds.slice(0, index + 1);
                                      setListIds([...tempIds]);
                                      return;
                                    }
                                    setListIds([...listIds, e.target.value]);
                                  }}
                                  value={item?.children
                                    ?.find((item: any) =>
                                      listIds.includes(item.id?.toString())
                                        ? item
                                        : "",
                                    )
                                    ?.id?.toString()}
                                >
                                  <option value="" dir={langDir} translate="no">
                                    {t("select_sub_category")}
                                  </option>
                                  {item?.children?.map((item: any) => (
                                    <option
                                      value={item.id?.toString()}
                                      key={item.id}
                                      dir={langDir}
                                    >
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))
                      : null}
                  </div>

                  <ControlledTextInput
                    label={t("product_name")}
                    name="productName"
                    placeholder={t("product_name")}
                    dir={langDir}
                    translate="no"
                  />

                  <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
                    <BrandSelect selectedProductType={formContext.getValues("typeOfProduct")} />

                    <div className="mt-2 flex flex-col gap-y-3">
                      <Label dir={langDir} translate="no">
                        {t("product_condition")}
                      </Label>
                      <Controller
                        name="productCondition"
                        control={formContext.control}
                        render={({ field }) => (
                          <ReactSelect
                            {...field}
                            onChange={(newValue) => {
                              field.onChange(newValue?.value);
                            }}
                            options={productConditions()}
                            value={productConditions().find(
                              (item: any) => item.value === field.value,
                            )}
                            styles={customStyles}
                            instanceId="productCondition"
                            placeholder={t("select")}
                          />
                        )}
                      />

                      <p className="text-[13px] text-red-500" dir={langDir}>
                        {
                          formContext.formState.errors["productCondition"]
                            ?.message as string
                        }
                      </p>
                    </div>
                  </div>

                  <AccordionMultiSelectV2
                    label={t("tags")}
                    name="productTagList"
                    options={tagsList || []}
                    placeholder={t("tags")}
                    canCreate={true}
                    createOption={handleCreateTag}
                    error={
                      formContext.formState.errors["productTagList"]
                        ?.message as string
                    }
                  />

                  <div className="relative mb-4 w-full">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none text-color-dark"
                        dir={langDir}
                        translate="no"
                      >
                        {t("product_image")}
                      </label>
                      <div className="flex w-full flex-wrap">
                        <div className="grid grid-cols-2 md:grid-cols-4">
                          {watchProductImages?.map(
                            (item: any, index: number) => (
                              <FormField
                                control={formContext.control}
                                name="productImages"
                                key={index}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative mb-3 w-full px-2">
                                        <div className="relative m-auto flex h-48 w-full flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                                          {watchProductImages?.length ? (
                                            <button
                                              type="button"
                                              className="common-close-btn-uploader-s1"
                                              onClick={() => {
                                                handleRemovePreviewImage(
                                                  item?.id,
                                                );
                                                if (photosRef.current)
                                                  photosRef.current.value = "";
                                              }}
                                            >
                                              <Image
                                                src={CloseWhiteIcon}
                                                alt="close-icon"
                                                height={22}
                                                width={22}
                                              />
                                            </button>
                                          ) : null}

                                          {item?.path && isImage(item.path) ? (
                                            <div className="relative h-44">
                                              <Image
                                                src={
                                                  typeof item.path === "object"
                                                    ? URL.createObjectURL(
                                                        item.path,
                                                      )
                                                    : typeof item.path ===
                                                        "string"
                                                      ? item.path
                                                      : "/images/no-image.jpg"
                                                }
                                                alt="profile"
                                                fill
                                                priority
                                              />
                                              <Input
                                                type="file"
                                                accept="image/*"
                                                multiple={false}
                                                className="!bottom-0 h-44 !w-full cursor-pointer opacity-0"
                                                onChange={(event) => {
                                                  if (event.target.files) {
                                                    if (
                                                      event.target.files[0]
                                                        .size > 524288000
                                                    ) {
                                                      toast({
                                                        title: t(
                                                          "one_of_file_should_be_less_than_size",
                                                          { size: "500MB" },
                                                        ),
                                                        variant: "danger",
                                                      });
                                                      return;
                                                    }
                                                    handleEditPreviewImage(
                                                      item?.id,
                                                      event.target.files,
                                                    );
                                                  }
                                                }}
                                                id="productImages"
                                              />
                                            </div>
                                          ) : item?.path &&
                                            isVideo(item.path) ? (
                                            <div className="relative h-44">
                                              <div className="player-wrapper px-2">
                                                <ReactPlayer
                                                  url={
                                                    typeof item.path ===
                                                    "object"
                                                      ? URL.createObjectURL(
                                                          item.path,
                                                        )
                                                      : typeof item.path ===
                                                          "string"
                                                        ? item.path
                                                        : "/images/no-image.jpg"
                                                  }
                                                  width="100%"
                                                  height="100%"
                                                  // playing
                                                  controls
                                                />
                                              </div>

                                              <div className="absolute h-20 w-full p-5">
                                                <p
                                                  className="rounded-lg border border-gray-300 bg-gray-100 py-2 text-sm font-semibold"
                                                  dir={langDir}
                                                  translate="no"
                                                >
                                                  {t("upload_video")}
                                                </p>
                                              </div>
                                              <Input
                                                type="file"
                                                accept="video/*"
                                                multiple={false}
                                                className="!bottom-0 h-20 !w-full cursor-pointer opacity-0"
                                                onChange={(event) => {
                                                  if (event.target.files) {
                                                    if (
                                                      event.target.files[0]
                                                        .size > 524288000
                                                    ) {
                                                      toast({
                                                        title: t(
                                                          "one_of_file_should_be_less_than_size",
                                                          { size: "500MB" },
                                                        ),
                                                        variant: "danger",
                                                      });
                                                      return;
                                                    }

                                                    handleEditPreviewImage(
                                                      item?.id,
                                                      event.target.files,
                                                    );
                                                  }
                                                }}
                                                id="productImages"
                                              />
                                            </div>
                                          ) : (
                                            <AddImageContent
                                              description={t("drop_your_file")}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ),
                          )}
                          <div className="relative mb-3 w-full pl-2">
                            <div className="absolute m-auto flex h-48 w-full cursor-pointer flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-center">
                              <div className="text-sm font-medium leading-4 text-color-dark">
                                <Image
                                  src="/images/plus.png"
                                  className="m-auto mb-3"
                                  alt="camera-icon"
                                  width={29}
                                  height={28}
                                />
                                <span dir={langDir} translate="no">
                                  {t("add_more")}
                                </span>
                              </div>
                            </div>

                            <Input
                              type="file"
                              accept="image/*, video/*"
                              multiple
                              className="!bottom-0 h-48 !w-full cursor-pointer opacity-0"
                              onChange={(event) => {
                                if (event.target.files) {
                                  const filesArray = Array.from(
                                    event.target.files,
                                  );

                                  if (
                                    filesArray.some(
                                      (file) => file.size > 524288000,
                                    )
                                  ) {
                                    toast({
                                      title: t(
                                        "one_of_file_should_be_less_than_size",
                                        { size: "500MB" },
                                      ),
                                      variant: "danger",
                                    });
                                    return;
                                  }

                                  const newImages = filesArray.map((file) => ({
                                    path: file,
                                    id: uuidv4(),
                                  }));
                                  const updatedProductImages = [
                                    ...(watchProductImages || []),
                                    ...newImages,
                                  ];
                                  formContext.setValue(
                                    "productImages",
                                    updatedProductImages,
                                  );
                                }
                              }}
                              id="productImages"
                              ref={photosRef}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <PriceSection activeProductType={activeProductType} />

                <DescriptionSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {subCategoryById.data?.data?.category_dynamicFormCategory?.length ? (
        <DynamicFormViewSection
          dynamicFormList={
            subCategoryById.data?.data?.category_dynamicFormCategory
          }
        />
      ) : null} */}
    </>
  );
};

export default BasicInformationSection;
