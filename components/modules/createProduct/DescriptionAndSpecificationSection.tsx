import React from "react";
import ControlledRichTextEditor from "@/components/shared/Forms/ControlledRichTextEditor";
import ControlledTextInput from "@/components/shared/Forms/ControlledTextInput";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import AddIcon from "@/public/images/add-icon.svg";
import TrashIcon from "@/public/images/social-delete-icon.svg";
import CloseWhiteIcon from "@/public/images/close-white.svg";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const DescriptionAndSpecificationSection = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const formContext = useFormContext();

  const fieldArrayForSpecification = useFieldArray({
    control: formContext.control,
    name: "productSpecificationList",
  });

  const appendSpecification = () =>
    fieldArrayForSpecification.append({
      label: "",
      specification: "",
    });

  const removeSpecification = (index: number) =>
    fieldArrayForSpecification.remove(index);

  const fieldArrayForVariants = useFieldArray({
    control: formContext.control,
    name: "productVariants",
  });

  const appendVariant = () =>
    fieldArrayForVariants.append({
      value: "",
      image: null,
    });

  const removeVariant = (index: number) => fieldArrayForVariants.remove(index);

  return (
    <div className="flex w-full flex-wrap">
      <h3 dir={langDir} translate="no">
        {t("description_n_specification")}
      </h3>
      <div className="mb-3.5 w-full">
        <div className="relative mb-4 w-full">
          <ControlledRichTextEditor
            label={t("description")}
            name="descriptionJson"
          />
        </div>
        <div className="relative mb-4 w-full">
          <div className="grid w-full grid-cols-1">
            <div>
              <div className="flex w-full items-center justify-between">
                <label
                  className="text-sm font-medium leading-none text-color-dark"
                  dir={langDir}
                  translate="no"
                >
                  {t("specification")}
                </label>

                <Button
                  type="button"
                  onClick={appendSpecification}
                  className="flex cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
                  dir={langDir}
                >
                  <Image src={AddIcon} className="mr-1" alt="add-icon" />
                  <span translate="no">{t("add_specification")}</span>
                </Button>
              </div>

              {fieldArrayForSpecification.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative mb-2 grid w-full grid-cols-1 gap-3 md:grid-cols-2"
                >
                  <ControlledTextInput
                    name={`productSpecificationList.${index}.label`}
                    placeholder={t("enter_label")}
                    label={t("label")}
                    dir={langDir}
                    translate="no"
                  />

                  <ControlledTextInput
                    name={`productSpecificationList.${index}.specification`}
                    placeholder={t("enter_value")}
                    label={t("value")}
                    dir={langDir}
                    translate="no"
                  />

                  {index !== 0 ? (
                    <Button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="absolute right-2 top-3 mt-5 flex -translate-y-2/4 cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
                      dir={langDir}
                    >
                      <Image src={TrashIcon} alt="social-delete-icon" />
                    </Button>
                  ) : null}
                </div>
              ))}

              <div className="mt-2 w-full">
                <label
                  className="text-sm font-medium leading-none text-color-dark"
                  dir={langDir}
                  translate="no"
                >
                  {t("variant_type")}
                </label>
                <ControlledTextInput
                  name={`productVariantType`}
                  label={t("variant_type")}
                  dir={langDir}
                  translate="no"
                />
              </div>

              <div className="flex w-full items-center justify-between">
                <label
                  className="text-sm font-medium leading-none text-color-dark"
                  dir={langDir}
                  translate="no"
                >
                  {t("variants")}
                </label>

                <Button
                  type="button"
                  onClick={appendVariant}
                  className="flex cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
                  dir={langDir}
                  translate="no"
                >
                  <Image src={AddIcon} className="mr-1" alt="add-icon" />
                  <span>{t("add_variant")}</span>
                </Button>
              </div>

              {fieldArrayForVariants.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid w-full grid-cols-1 gap-5 md:grid-cols-2"
                >
                  <div className="relative mb-3 mt-2 w-full px-2">
                    {formContext.getValues(`productVariants.${index}.image`) ? (
                      <>
                        <div className="relative m-auto flex h-48 w-full flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                          <button
                            type="button"
                            className="common-close-btn-uploader-s1"
                            onClick={() => {
                              fieldArrayForVariants.update(index, {
                                value: formContext.getValues(
                                  `productVariants.${index}.value`,
                                ),
                                image: null,
                              });
                            }}
                          >
                            <Image
                              src={CloseWhiteIcon}
                              alt="close-icon"
                              height={22}
                              width={22}
                            />
                          </button>
                          {(() => {
                            const image = formContext.getValues(
                              `productVariants.${index}.image`,
                            );

                            return (
                              <Image
                                src={URL.createObjectURL(image)}
                                alt="profile"
                                fill
                                priority
                              />
                            );
                          })()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute m-auto flex h-48 w-full cursor-pointer flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-center">
                          <div className="text-sm font-medium leading-4 text-color-dark">
                            <Image
                              src="/images/plus.png"
                              className="m-auto mb-3"
                              alt="camera-icon"
                              width={29}
                              height={28}
                            />
                          </div>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple={false}
                          className="!bottom-0 h-44 !w-full cursor-pointer opacity-0"
                          onChange={(event) => {
                            if (event.target.files) {
                              if (event.target.files[0].size > 524288000) {
                                toast({
                                  title: t(
                                    "one_of_file_should_be_less_than_size",
                                    { size: "500MB" },
                                  ),
                                  variant: "danger",
                                });
                                return;
                              }
                              fieldArrayForVariants.update(index, {
                                value: formContext.getValues(
                                  `productVariants.${index}.value`,
                                ),
                                image: event.target.files[0],
                              });
                            }
                          }}
                          id={`productVariants.${index}.image`}
                        />
                      </>
                    )}
                  </div>
                  <ControlledTextInput
                    name={`productVariants.${index}.value`}
                    placeholder={t("enter_value")}
                    label={t("value")}
                    dir={langDir}
                    translate="no"
                  />

                  {index !== 0 ? (
                    <Button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="absolute right-2 top-3 mt-5 flex -translate-y-2/4 cursor-pointer items-center bg-transparent p-0 text-sm font-semibold capitalize text-dark-orange shadow-none hover:bg-transparent"
                      dir={langDir}
                    >
                      <Image src={TrashIcon} alt="social-delete-icon" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionAndSpecificationSection;
