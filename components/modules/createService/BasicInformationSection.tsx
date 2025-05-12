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
import { PRODUCT_CONDITION_LIST } from "@/utils/constants";
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

type serviceImageProps = {
  path: string;
  id: string;
};

type BasicInformationProps = {
  editId?: string,
  tagsList: any;
  activeProductType?: string;
};

const BasicInformationSection: React.FC<BasicInformationProps> = ({
  editId,
  tagsList,
  activeProductType,
}) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const formContext = useFormContext();
  const { toast } = useToast();
  const photosRef = useRef<HTMLInputElement>(null);
  const createTag = useCreateTag();
  const [listIds, setListIds] = useState<string[]>([]);
  const [catList, setCatList] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string>("6");//static id for services
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // const upload = useUploadFile();
  const categoryQuery = useCategory("1");
  const subCategoryById = useSubCategoryById(currentId, !!currentId);

  const watchServiceImages = formContext.watch("images");
  const watchCategoryLocation = formContext.watch("categoryLocation");
  const doneOnce = useRef(false);
  useEffect(() => {
    if (editId && watchCategoryLocation && catList.length && doneOnce.current === false) {
      const ids = watchCategoryLocation.split(",");
      setListIds(ids);
      let foundId = "";
      catList?.forEach((v) => {
        foundId = v.children.find((sv: any) => sv.id == ids[0])?.id?.toString();
      });
      if (foundId) {
        setCurrentId(foundId);
        setCurrentIndex(ids.length - 1);
      }
      doneOnce.current = true
    }
  }, [editId, watchCategoryLocation, catList]);
  const memoizedCategories = useMemo(() => {
    return (
      categoryQuery?.data?.data?.children[0]?.children.map((item: any) => {
        return { label: item.name, value: item.id };
      }) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryQuery?.data?.data?.children?.length]);

  const handleEditPreviewImage = (id: string, item: FileList) => {
    const tempArr = watchServiceImages || [];
    const filteredFormItem = tempArr.filter(
      (item: serviceImageProps) => item.id === id,
    );
    if (filteredFormItem.length) {
      filteredFormItem[0].path = item[0];
      formContext.setValue("images", [...tempArr]);
    }
  };

  const handleRemovePreviewImage = (id: string) => {
    formContext.setValue("images", [
      ...(watchServiceImages || []).filter(
        (item: serviceImageProps) => item.id !== id,
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
      let selected = formContext.getValues("tags") || [];
      selected.push({ value: response.data.id, label: response.data.tagName });
      formContext.setValue("tags", selected);
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
      if (subCategoryById.data?.data?.children?.length) {
        tempList[currentIndex] = subCategoryById.data?.data;
        tempList = tempList.slice(0, currentIndex + 1);
      }
      setCatList([...tempList]);
      return;
    }

    if (subCategoryById.data?.data?.children?.length) {
      setCatList([...catList, subCategoryById.data?.data]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, subCategoryById.data?.data?.children?.length, currentIndex]);

  useEffect(
    () => formContext.setValue("categoryId", Number(currentId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentId],
  );

  useEffect(
    () => formContext.setValue("categoryLocation", listIds.join(",")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listIds?.length],
  );

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-x-5">
        <div className="col-span-4 mx-auto mb-3 w-full max-w-[950px] rounded-lg border border-solid border-gray-300 bg-white p-2 shadow-sm sm:p-3 lg:p-4">
          <div className="flex w-full flex-wrap">
            <div className=" w-full">
              <div className="flex flex-wrap">
                <div className="form-groups-common-sec-s1">
                  <h3 dir={langDir} translate="no">{t("basic_information")}</h3>
                  <div className="mb-3 grid w-full grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
                    <div className="flex w-full flex-col justify-between gap-y-2">
                      <Label dir={langDir} translate="no">{t("service_category")}</Label>
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
                            <option value="" dir={langDir} translate="no">{t("select_category")}</option>
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
                      <p className="text-[13px] font-medium text-red-500" dir={langDir}>
                        {
                          formContext.formState.errors["categoryId"]
                            ?.message as string
                        }
                      </p>
                    </div>

                    {catList.length > 0 ?
                      catList.map((item, index) => {
                        return (
                          <div
                            key={item?.id}
                            className="mb-3 grid w-full grid-cols-1 gap-x-5 gap-y-3"
                          >
                            <div className="flex w-full flex-col justify-between gap-y-2">
                              <Label dir={langDir} translate="no">{t("sub_category")}</Label>
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
                                <option value="" dir={langDir} translate="no">{t("select_sub_category")}</option>
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
                        )
                      }) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-color-dark" dir={langDir} translate="no">
                      {t("service_name")}
                    </label>
                    <ControlledTextInput
                      label={t("service_name")}
                      name="serviceName"
                      placeholder={t("service_name")}
                      dir={langDir}
                      disabled={!!editId}
                      translate="no"
                    />
                  </div>
                  <div className="mt-2">
                    <AccordionMultiSelectV2
                      label={t("tags")}
                      name="tags"
                      options={tagsList || []}
                      placeholder={t("tags")}
                      canCreate={true}
                      createOption={handleCreateTag}
                      error={
                        formContext.formState.errors["tags"]?.message as string
                      }
                    />
                  </div>
                  <div className="relative mb-4 w-full">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-color-dark" dir={langDir} translate="no">
                        {t("service_image")}
                      </label>
                      <div className="flex w-full flex-wrap">
                        <div className="grid grid-cols-2 md:grid-cols-4">
                          {watchServiceImages?.map(
                            (item: any, index: number) => (
                              <FormField
                                control={formContext.control}
                                name="images"
                                key={index}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative mb-3 w-full px-2">
                                        <div className="relative m-auto flex h-48 w-full flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                                          {watchServiceImages?.length ? (
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
                                                loading="eager" // Forces eager loading instead of lazy
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
                                                        title: t("one_of_file_should_be_less_than_size", { size: "500MB" }),
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
                                                id="images"
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
                                                <p className="rounded-lg border border-gray-300 bg-gray-100 py-2 text-sm font-semibold" dir={langDir} translate="no">
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
                                                        title: t("one_of_file_should_be_less_than_size", { size: "500MB" }),
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
                                                id="images"
                                              />
                                            </div>
                                          ) : (
                                            <AddImageContent description={t("drop_your_file")} />
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
                                <span dir={langDir} translate="no">{t("add_more")}</span>
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
                                      title: t("one_of_file_should_be_less_than_size", { size: "500MB" }),
                                      variant: "danger",
                                    });
                                    return;
                                  }

                                  const newImages = filesArray.map((file) => ({
                                    path: file,
                                    id: uuidv4(),
                                  }));
                                  const updatedServiceImages = [
                                    ...(watchServiceImages || []),
                                    ...newImages,
                                  ];
                                  formContext.setValue(
                                    "images",
                                    updatedServiceImages,
                                  );
                                }
                              }}
                              id="images"
                              ref={photosRef}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <PriceSection activeProductType={activeProductType} /> */}

                {/* <DescriptionSection /> */}
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
