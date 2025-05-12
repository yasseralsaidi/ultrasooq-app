"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTags } from "@/apis/queries/tags.queries";
import BasicInformationSection from "@/components/modules/createProduct/BasicInformationSection";
import ProductDetailsSection from "@/components/modules/createProduct/ProductDetailsSection";
import DescriptionAndSpecificationSection from "@/components/modules/createProduct/DescriptionAndSpecificationSection";
import Footer from "@/components/shared/Footer";
import { useCreateProduct, useProductById, useProductVariant } from "@/apis/queries/product.queries";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadMultipleFile } from "@/apis/queries/upload.queries";
import {
  ALPHANUMERIC_REGEX,
  BUYGROUP_MENU_ID,
  FACTORIES_MENU_ID,
  RFQ_MENU_ID,
  STORE_MENU_ID,
  imageExtensions,
  videoExtensions,
} from "@/utils/constants";
import BackgroundImage from "@/public/images/before-login-bg.png";
import { convertDate, convertTime, generateRandomSkuNoWithTimeStamp, handleDescriptionParse } from "@/utils/helper";
import LoaderWithMessage from "@/components/shared/LoaderWithMessage";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const baseProductPriceItemSchema = (t: any) => {
  return z.object({
    consumerType: z.string().trim().optional(),
    sellType: z.string().trim().optional(),
    consumerDiscount: z.coerce.number().optional().or(z.literal("")),
    vendorDiscount: z.coerce.number().optional().or(z.literal("")),
    consumerDiscountType: z.coerce.string().optional(),
    vendorDiscountType: z.coerce.string().optional(),
    minCustomer: z.coerce.number().optional().or(z.literal("")),
    maxCustomer: z.coerce.number().optional().or(z.literal("")),
    minQuantityPerCustomer: z.coerce.number().optional().or(z.literal("")),
    maxQuantityPerCustomer: z.coerce.number().optional().or(z.literal("")),
    minQuantity: z.coerce.number().optional().or(z.literal("")),
    maxQuantity: z.coerce.number().optional().or(z.literal("")),
    dateOpen: z.coerce.string().optional(),
    dateClose: z.coerce.string().optional(),
    startTime: z.coerce.string().optional(),
    endTime: z.coerce.string().optional().or(z.literal("")),
    timeOpen: z.coerce.number().optional().or(z.literal("")),
    timeClose: z.coerce.number().optional(),
    deliveryAfter: z.coerce.number().optional().or(z.literal("")),
    stock: z.coerce.number().optional().or(z.literal("")),
  });
};

const productPriceItemSchemaWhenSetUpPriceTrue = (t: any) => {
  return baseProductPriceItemSchema(t)
    .extend({
      consumerType: z
        .string()
        .trim()
        .min(1, { message: t("consumer_type_is_required") }),
      sellType: z
        .string()
        .trim()
        .min(1, { message: t("sell_type_is_required") }),
      consumerDiscount: z.coerce
        .number()
        .max(100, { message: t("consumer_discount_must_be_less_than_100") }),
      vendorDiscount: z.coerce
        .number()
        .max(100, { message: t("vendor_discount_must_be_less_than_100") }),
      deliveryAfter: z.coerce
        .number()
        .min(1, { message: t("delivery_after_is_required") }),
    })
    .refine(
      ({ minQuantity, maxQuantity, sellType }) =>
        sellType != "BUYGROUP" ||
        (minQuantity && Number(minQuantity || 0) < Number(maxQuantity || 0)) ||
        (maxQuantity && Number(minQuantity || 0) < Number(maxQuantity || 0)),
      {
        message: t("min_quantity_must_be_less_than_max_quantity"),
        path: ["minQuantity"],
      },
    )
    .refine(
      ({ minQuantityPerCustomer, maxQuantityPerCustomer }) =>
        (minQuantityPerCustomer &&
          Number(minQuantityPerCustomer || 0) <
          Number(maxQuantityPerCustomer || 0)) ||
        (maxQuantityPerCustomer &&
          Number(minQuantityPerCustomer || 0) <
          Number(maxQuantityPerCustomer || 0)),
      {
        message: t(
          "min_quantity_per_customer_must_be_less_than_max_quantity_per_customer",
        ),
        path: ["minQuantityPerCustomer"],
      },
    )
    .refine(
      ({ minCustomer, maxCustomer }) =>
        (!minCustomer || minCustomer) <= (!maxCustomer || maxCustomer),
      {
        message: t("min_customer_must_be_less_than_or_equal_to_max_customer"),
        path: ["minCustomer"],
      },
    )
    .superRefine((schema, ctx) => {
      const {
        sellType,
        minQuantityPerCustomer,
        maxQuantityPerCustomer,
        minQuantity,
        maxQuantity,
        minCustomer,
        maxCustomer,
        startTime,
        endTime,
      } = schema;
      if (sellType === "NORMALSELL" || sellType === "BUYGROUP") {
        if (!minQuantityPerCustomer) {
          ctx.addIssue({
            code: "custom",
            message: t("quantity_per_customer_is_required"),
            path: ["minQuantityPerCustomer"],
          });
        }
        if (!maxQuantityPerCustomer) {
          ctx.addIssue({
            code: "custom",
            message: t("quantity_per_customer_is_required"),
            path: ["maxQuantityPerCustomer"],
          });
        }
      }
      if (sellType === "BUYGROUP") {
        if (!minQuantity) {
          ctx.addIssue({
            code: "custom",
            message: t("min_quantity_is_required"),
            path: ["minQuantity"],
          });
        }
      }
      if (sellType === "BUYGROUP") {
        if (!maxQuantity) {
          ctx.addIssue({
            code: "custom",
            message: t("max_quantity_is_required"),
            path: ["maxQuantity"],
          });
        }
      }
      if (sellType === "BUYGROUP") {
        if (!minCustomer) {
          ctx.addIssue({
            code: "custom",
            message: t("min_customer_is_required"),
            path: ["minCustomer"],
          });
        }
      }
      if (sellType === "BUYGROUP") {
        if (!maxCustomer) {
          ctx.addIssue({
            code: "custom",
            message: t("max_customer_is_required"),
            path: ["maxCustomer"],
          });
        }
      }
      if (sellType == "BUYGROUP") {
        if (
          (minQuantity &&
            Number(minQuantity || 0) > Number(maxQuantity || 0)) ||
          (maxQuantity && Number(minQuantity || 0) > Number(maxQuantity || 0))
        ) {
          ctx.addIssue({
            code: "custom",
            message: t("min_quantity_must_be_less_than_max_quantity"),
            path: ["maxQuantity"],
          });
        }
      }
      // if (sellType === "BUYGROUP") {
      //   if (!startTime) {
      //     ctx.addIssue({ code: "custom", message: t("time_open_is_required"), path: ["startTime"], });
      //   }
      // }
      // if (sellType === "BUYGROUP") {
      //   if (!endTime) {
      //     ctx.addIssue({ code: "custom", message: t("time_close_is_required"), path: ["endTime"], });
      //   }
      // }
    });
};

const formSchemaForTypeP = (t: any) => {
  return z
    .object({
      productName: z
        .string()
        .trim()
        .min(2, { message: t("product_name_is_required") })
        .max(50, {
          message: t("product_name_must_be_less_than_50_characters"),
        }),
      categoryId: z.number().optional(),
      categoryLocation: z.string().trim().optional(),
      typeOfProduct: z
        .string({
          required_error: t("provide_you_product_type"),
          message: t("provide_you_product_type"),
        })
        .trim(),
      brandId: z.number().min(1, { message: t("brand_is_required") }),
      // productLocationId: z.number().min(1, { message: t("product_location_is_required") }),
      productCountryId: z
        .number()
        .min(1, { message: t("product_country_is_required") }),
      productStateId: z
        .number()
        .min(1, { message: t("product_state_is_required") }),
      productCityId: z
        .number()
        .min(1, { message: t("product_city_is_required") }),
      productTown: z.string().trim().optional(),
      productLatLng: z.string().trim().optional(),
      sellCountryIds: z.any().optional(),
      sellStateIds: z.any().optional(),
      sellCityIds: z.any().optional(),
      skuNo: z.string().trim().optional(),
      productCondition: z
        .string()
        .trim()
        .min(1, { message: t("product_condition_is_required") }),
      productTagList: z
        .array(
          z.object({
            label: z.string().trim(),
            value: z.number(),
          }),
          {
            invalid_type_error: t("tag_is_required"),
            required_error: t("tag_is_required"),
          },
        )
        .min(1, { message: t("tag_is_required") })
        .transform((value) => value.map((item) => ({ tagId: item.value }))),
      productImagesList: z.any().optional(),
      productPrice: z.coerce.number().optional().or(z.literal("")),
      offerPrice: z.coerce.number().optional().or(z.literal("")),
      placeOfOriginId: z
        .number()
        .min(1, { message: t("place_of_origin_is_required") }),
      productShortDescriptionList: z.array(
        z.object({
          shortDescription: z
            .string()
            .trim()
            .min(2, { message: t("short_description_is_required") })
            .max(20, {
              message: t("short_description_must_be_less_than_20_characters"),
            }),
        }),
      ),
      productSpecificationList: z.array(
        z.object({
          label: z
            .string()
            .trim()
            .min(2, { message: t("label_is_required") })
            .max(20, { message: t("label_must_be_less_than_20_characters") }),
          specification: z
            .string()
            .trim()
            .min(1, { message: t("specification_is_required") })
            .max(20, {
              message: t("specification_must_be_less_than_20_characters"),
            })
            .refine((val) => ALPHANUMERIC_REGEX.test(val), {
              message: t("specification_must_contain_only_letters_or_digits"),
            }),
        }),
      ),
      description: z.string().trim().optional(),
      descriptionJson: z.array(z.any()).optional(),
      productPriceList: z.array(baseProductPriceItemSchema(t)).optional(),
      setUpPrice: z.boolean(),
      isStockRequired: z.boolean().optional(),
      isOfferPriceRequired: z.boolean().optional(),
      isCustomProduct: z.boolean().optional(),
      productVariantType: z
        .string()
        .trim()
        .min(3, {
          message: t("variant_type_must_be_equal_greater_than_2_characters"),
        })
        .max(20, { message: t("variant_type_must_be_less_than_20_characters") })
        .optional()
        .or(z.literal("")),
      productVariants: z.array(
        z.object({
          value: z
            .string()
            .trim()
            .min(1, { message: t("value_is_required") })
            .max(20, {
              message: t("value_must_be_less_than_n_characters", { n: 20 }),
            })
            .optional()
            .or(z.literal("")),
          image: z.any().optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      const variantsCount = data.productVariants.filter((el) =>
        el.value?.trim(),
      ).length;
      if (data.productVariantType?.trim() && variantsCount == 0) {
        ctx.addIssue({
          code: "custom",
          message: t("value_is_required"),
          path: ["productVariants.0.value"],
        });
      }
      if (variantsCount > 0 && !data.productVariantType?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: t("variant_type_is_required"),
          path: ["productVariantType"],
        });
      }

      if (data.setUpPrice) {
        const result = z
          .array(productPriceItemSchemaWhenSetUpPriceTrue(t))
          .safeParse(data.productPriceList);

        if (!result.success) {
          result.error.issues.forEach((issue) => ctx.addIssue(issue));
        }
      } else {
        data.productPrice = 0;
        data.offerPrice = 0;
        if (Array.isArray(data.productPriceList)) {
          data.productPriceList = data.productPriceList.map((item) => ({
            consumerType: "",
            sellType: "",
            consumerDiscount: 0,
            vendorDiscount: 0,
            consumerDiscountType: "",
            vendorDiscountType: "",
            minCustomer: 0,
            maxCustomer: 0,
            minQuantityPerCustomer: 0,
            maxQuantityPerCustomer: 0,
            minQuantity: 0,
            maxQuantity: 0,
            dateOpen: "",
            dateClose: "",
            timeOpen: 0,
            timeClose: 0,
            startTime: "",
            endTime: "",
            deliveryAfter: 0,
            stock: 0,
          }));
        }
      }
    });
};

const formSchemaForTypeR = (t: any) => {
  return z
    .object({
      productName: z
        .string()
        .trim()
        .min(2, { message: t("product_name_is_required") })
        .max(50, {
          message: t("product_name_must_be_less_than_50_characters"),
        }),
      categoryId: z.number().optional(),
      categoryLocation: z.string().trim().optional(),
      typeOfProduct: z
        .string({
          required_error: t("provide_you_product_type"),
          message: t("provide_you_product_type"),
        })
        .trim(),
      brandId: z.number().min(1, { message: t("brand_is_required") }),
      productCondition: z
        .string()
        .trim()
        .min(1, { message: t("product_condition_is_required") }),
      productTagList: z
        .array(
          z.object({
            label: z.string().trim(),
            value: z.number(),
          }),
        )
        .min(1, { message: t("tag_is_required") })
        .transform((value) => {
          let temp: any = [];
          value.forEach((item) => {
            temp.push({ tagId: item.value });
          });
          return temp;
        }),
      productImagesList: z.any().optional(),
      productPrice: z.coerce.number().optional(),
      offerPrice: z.coerce.number().optional(),
      placeOfOriginId: z
        .number()
        .min(1, { message: t("place_of_origin_is_required") }),
      productShortDescriptionList: z.array(
        z.object({
          shortDescription: z
            .string()
            .trim()
            .min(2, { message: t("short_description_is_required") })
            .max(20, {
              message: t("short_description_must_be_less_than_20_characters"),
            }),
        }),
      ),
      productSpecificationList: z.array(
        z.object({
          label: z
            .string()
            .trim()
            .min(2, { message: t("label_is_required") })
            .max(20, { message: t("label_must_be_less_than_20_characters") }),
          specification: z
            .string()
            .trim()
            .min(2, { message: t("specification_is_required") })
            .max(20, {
              message: t("specification_must_be_less_than_20_characters"),
            }),
        }),
      ),
      description: z.string().trim().optional(),
      descriptionJson: z.array(z.any()).optional(),
      setUpPrice: z.boolean(),
      isStockRequired: z.boolean().optional(),
      isOfferPriceRequired: z.boolean().optional(),
      isCustomProduct: z.boolean().optional(),
      productVariantType: z
        .string()
        .trim()
        .min(3, {
          message: t("variant_type_must_be_equal_greater_than_2_characters"),
        })
        .max(20, { message: t("variant_type_must_be_less_than_20_characters") })
        .optional()
        .or(z.literal("")),
      productVariants: z.array(
        z.object({
          value: z
            .string()
            .trim()
            .min(1, { message: t("value_is_required") })
            .max(20, {
              message: t("value_must_be_less_than_n_characters", { n: 20 }),
            })
            .optional()
            .or(z.literal("")),
          image: z.any().optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      const variantsCount = data.productVariants.filter((el) =>
        el.value?.trim(),
      ).length;
      if (data.productVariantType?.trim() && variantsCount == 0) {
        ctx.addIssue({
          code: "custom",
          message: t("value_is_required"),
          path: ["productVariants.0.value"],
        });
      }
      if (variantsCount > 0 && !data.productVariantType?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: t("variant_type_is_required"),
          path: ["productVariantType"],
        });
      }

      if (data.setUpPrice) {
        // if (data.offerPrice === 0) {
        //   ctx.addIssue({
        //     code: "custom",
        //     message: t("offer_price_is_required"),
        //     path: ["offerPrice"],
        //   });
        // }
      }
    });
};

const defaultValues: { [key: string]: any } = {
  productName: "",
  categoryId: 0,
  categoryLocation: "",
  typeOfProduct: "",
  brandId: 0,
  skuNo: "",
  productCondition: "",
  productTagList: undefined,
  productImagesList: undefined,
  productPrice: "",
  offerPrice: "",
  placeOfOriginId: 0,
  // productLocationId: 0,
  productCountryId: 0,
  productStateId: 0,
  productCityId: 0,
  sellCountryIds: [],
  sellStateIds: [],
  sellCityIds: [],
  productTown: "",
  productLatLng: "",
  productShortDescriptionList: [
    {
      shortDescription: "",
    },
  ],
  productSpecificationList: [
    {
      label: "",
      specification: "",
    },
  ],
  description: "",
  descriptionJson: undefined,
  productImages: [],
  productPriceList: [
    {
      consumerType: "",
      sellType: "",
      consumerDiscount: "",
      vendorDiscount: "",
      consumerDiscountType: "",
      vendorDiscountType: "",
      minCustomer: "",
      maxCustomer: "",
      minQuantityPerCustomer: "",
      maxQuantityPerCustomer: "",
      minQuantity: "",
      maxQuantity: "",
      dateOpen: "",
      dateClose: "",
      timeOpen: "",
      timeClose: "",
      startTime: "",
      endTime: "",
      deliveryAfter: "",
      stock: "",
    },
  ],
  setUpPrice: true,
  isStockRequired: false,
  isOfferPriceRequired: false,
  isCustomProduct: false,
  productVariants: [
    {
      value: "",
      image: null,
    },
  ],
};

const CreateProductPage = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get('copy');
  const { toast } = useToast();
  const [activeProductType, setActiveProductType] = useState<string>();
  const form = useForm({
    resolver: zodResolver(
      activeProductType === "R" ? formSchemaForTypeR(t) : formSchemaForTypeP(t),
    ),
    defaultValues,
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const uploadMultiple = useUploadMultipleFile();
  const tagsQuery = useTags();
  const createProduct = useCreateProduct();
  const watchProductImages = form.watch("productImages");
  const watchSetUpPrice = form.watch("setUpPrice");

  const productQueryById = useProductById(
    {
      productId: productId || ''
    },
    !!productId,
  );
  const getProductVariant = useProductVariant();

  const memoizedTags = useMemo(() => {
    return (
      tagsQuery?.data?.data.map((item: { id: string; tagName: string }) => {
        return { label: item.tagName, value: item.id };
      }) || []
    );
  }, [tagsQuery?.data]);

  const handleUploadedFile = async (list: any[]) => {
    if (list?.length) {
      const formData = new FormData();

      list.forEach((item: { path: File; id: string }) => {
        formData.append("content", item.path);
      });

      const response = await uploadMultiple.mutateAsync(formData);
      if (response.status && response.data) {
        return response.data;
      }
    }
  };

  const fetchProductVariant = async (productPriceId: number) => {
    const response = await getProductVariant.mutateAsync([productPriceId]);
    const variants = response?.data?.[0]?.object || [];
    if (variants.length > 0) {
      form.setValue("productVariantType", variants[0].type);
      form.setValue("productVariants", variants.map((variant: any) => {
        return {
          value: variant.value,
          image: null
        };
      }));
    }
  }

  useEffect(() => {
    if (productQueryById?.data?.data) {
      const product = productQueryById?.data?.data;
      
      form.setValue("categoryId", product.categoryId);
      form.setValue("categoryLocation", product.categoryLocation);
      setSelectedCategoryIds(
        product.categoryLocation.split(',').filter((item: string) => item)
      );

      form.setValue("productName", product.productName);
      form.setValue("typeOfProduct", product.typeOfProduct);
      form.setValue("brandId", product.brandId);
      form.setValue("productCondition", product.product_productPrice?.[0]?.productCondition);
      form.setValue(
        "productTagList",
        product.productTags?.filter((item: any) => item.productTagsTag)?.map((item: any) => {
          return {
            label: item.productTagsTag.tagName,
            value: item.productTagsTag.id
          }
        }) || []
      );

      if (product.product_productPrice?.length) {
        form.setValue("productPriceList.[0].consumerType", product.product_productPrice[0]?.consumerType);
        form.setValue("productPriceList.[0].consumerDiscount", product.product_productPrice[0]?.consumerDiscount);
        form.setValue("productPriceList.[0].consumerDiscountType", product.product_productPrice[0]?.consumerDiscountType);
        form.setValue("productPriceList.[0].vendorDiscount", product.product_productPrice[0]?.consumerDiscount);
        form.setValue("productPriceList.[0].vendorDiscountType", product.product_productPrice[0]?.vendorDiscountType);
        form.setValue("productPriceList.[0].sellType", product.product_productPrice[0]?.sellType);
        form.setValue("productPriceList.[0].minCustomer", product.product_productPrice[0]?.minCustomer);
        form.setValue("productPriceList.[0].maxCustomer", product.product_productPrice[0]?.maxCustomer);
        form.setValue("productPriceList.[0].minQuantityPerCustomer", product.product_productPrice[0]?.minQuantityPerCustomer);
        form.setValue("productPriceList.[0].maxQuantityPerCustomer", product.product_productPrice[0]?.maxQuantityPerCustomer);
        form.setValue("productPriceList.[0].minQuantity", product.product_productPrice[0]?.minQuantity);
        form.setValue("productPriceList.[0].maxQuantity", product.product_productPrice[0]?.maxQuantity);
        if (product.product_productPrice[0]?.dateOpen) {
          form.setValue("productPriceList.[0].dateOpen", product.product_productPrice[0]?.dateOpen);
        }
        form.setValue("productPriceList.[0].startTime", product.product_productPrice[0]?.timeOpen);
        if (product.product_productPrice[0]?.dateClose) {
          form.setValue("productPriceList.[0].dateClose", product.product_productPrice[0]?.dateClose);
        }
        form.setValue("productPriceList.[0].endTime", product.product_productPrice[0]?.timeClose);
        form.setValue("productPriceList.[0].deliveryAfter", product.product_productPrice[0]?.deliveryAfter);
        form.setValue("productPrice", product.product_productPrice[0]?.productPrice);
        form.setValue("offerPrice", product.product_productPrice[0]?.offerPrice);
        form.setValue("productPriceList.[0].stock", product.product_productPrice[0]?.stock);
      }

      form.setValue("productCountryId", product.product_productPrice[0]?.productCountryId);
      form.setValue("productStateId", product.product_productPrice[0]?.productStateId);
      form.setValue("productCityId", product.product_productPrice[0]?.productCityId);
      form.setValue("productTown", product?.product_productPrice[0]?.productTown);
      form.setValue("productLatLng", product?.product_productPrice[0]?.productLatLng);

      form.setValue("sellCountryIds", product?.product_sellCountry?.map((item: any) => {
        return {
          label: item.countryName,
          value: item.countryId
        };
      }) || []);
      form.setValue("sellStateIds", product?.product_sellState?.map((item: any) => {
        return {
          label: item.stateName,
          value: item.stateId
        };
      }) || []);
      form.setValue("sellCityIds", product?.product_sellCity?.map((item: any) => {
        return {
          label: item.cityName,
          value: item.cityId
        };
      }) || []);
      form.setValue("placeOfOriginId", product?.placeOfOriginId);

      const productShortDescriptionList = product
        ?.product_productShortDescription?.length
        ? product?.product_productShortDescription.map((item: any) => ({
          shortDescription: item?.shortDescription,
          shortDescriptionJson: [
            {
              children: [
                {
                  text: item?.shortDescription
                }
              ],
              type: 'p'
            }
          ]
        }))
        : [
          {
            shortDescription: "",
          },
        ];

      form.setValue("productShortDescriptionList", productShortDescriptionList)
      form.setValue("description", product?.description || "");
      form.setValue("descriptionJson", product?.description ? handleDescriptionParse(product?.description) : undefined);

      form.setValue("productSpecificationList", product.product_productSpecification?.map((item: any) => {
        return {
          label: item.label,
          specification: item.specification
        }
      }) || []);

      if (product.product_productPrice?.length) {
        fetchProductVariant(product.product_productPrice?.[0]?.id);
      }
    }
  }, [productQueryById?.data?.data]);

  const onSubmit = async (formData: any) => {
    const updatedFormData = {
      ...formData,
      productType:
        activeProductType === "R" ? "R" : activeProductType === "F" ? "F" : "P",
      status:
        activeProductType === "R" || activeProductType === "F"
          ? "ACTIVE"
          : "INACTIVE",
    };

    updatedFormData.productImagesList = [];

    if (watchProductImages.length) {
      const fileTypeArrays = watchProductImages.filter(
        (item: any) => typeof item.path === "object",
      );

      const imageUrlArray: any = fileTypeArrays?.length
        ? await handleUploadedFile(fileTypeArrays)
        : [];

      updatedFormData.productImages = [...imageUrlArray];

      if (updatedFormData.productImages.length) {
        updatedFormData.productImagesList = updatedFormData.productImages.map(
          (item: string) => {
            const extension = item.split(".").pop()?.toLowerCase();

            if (extension) {
              if (videoExtensions.includes(extension)) {
                const videoName: string = item.split("/").pop()!;
                return { video: item, videoName };
              } else if (imageExtensions.includes(extension)) {
                const imageName: string = item.split("/").pop()!;
                return { image: item, imageName };
              }
            }

            return { image: item, imageName: item };
          },
        );
      }
    }
    const randomSkuNo = generateRandomSkuNoWithTimeStamp().toString();

    delete updatedFormData.productImages;
    updatedFormData.productPriceList = [
      {
        ...(activeProductType !== "R" && updatedFormData.productPriceList[0]),
        askForStock: updatedFormData.isStockRequired ? "true" : "false",
        askForPrice: updatedFormData.isOfferPriceRequired ? "true" : "false",
        isCustomProduct: updatedFormData.isCustomProduct ? "true" : "false",
        productPrice: updatedFormData.isOfferPriceRequired
          ? 0
          : activeProductType === "R"
            ? (updatedFormData.offerPrice ?? 0)
            : (updatedFormData.productPrice ?? 0),
        offerPrice: updatedFormData.isOfferPriceRequired
          ? 0
          : activeProductType === "R"
            ? (updatedFormData.offerPrice ?? 0)
            : (updatedFormData.productPrice ?? 0),
        stock: updatedFormData.isStockRequired
          ? 0
          : updatedFormData.productPriceList?.[0]?.stock
            ? updatedFormData.productPriceList[0].stock
            : 0,
        productCountryId: updatedFormData.productCountryId,
        productStateId: updatedFormData.productStateId,
        productCityId: updatedFormData.productCityId,
        productCondition: updatedFormData.productCondition,
        productTown: updatedFormData.productTown,
        productLatLng: updatedFormData.productLatLng,
        sellCountryIds: updatedFormData.sellCountryIds,
        sellStateIds: updatedFormData.sellStateIds,
        sellCityIds: updatedFormData.sellCityIds,
        status:
          activeProductType === "R"
            ? updatedFormData.offerPrice || updatedFormData.isOfferPriceRequired
              ? "ACTIVE"
              : "INACTIVE"
            : updatedFormData.productPrice ||
              updatedFormData.isOfferPriceRequired
              ? "ACTIVE"
              : "INACTIVE",
      },
    ];

    if (activeProductType === "R") {
      updatedFormData.productPriceList[0] = {
        consumerType: "",
        sellType: "",
        consumerDiscount: 0,
        vendorDiscount: 0,
        consumerDiscountType: "",
        vendorDiscountType: "",
        minCustomer: 0,
        maxCustomer: 0,
        minQuantityPerCustomer: 0,
        maxQuantityPerCustomer: 0,
        minQuantity: 0,
        maxQuantity: 0,
        timeOpen: 0,
        timeClose: 0,
        deliveryAfter: 0,
        stock: 0,
        askForStock: updatedFormData.isStockRequired ? "true" : undefined,
        askForPrice: updatedFormData.isOfferPriceRequired ? "true" : undefined,
        ...updatedFormData.productPriceList[0],
      };
      delete updatedFormData.productPriceList[0].productCountryId;
      delete updatedFormData.productPriceList[0].productStateId;
      delete updatedFormData.productPriceList[0].productCityId;
      delete updatedFormData.productPriceList[0].productTown;
      delete updatedFormData.productPriceList[0].productLatLng;
      delete updatedFormData.productPriceList[0].sellCountryIds;
      delete updatedFormData.productPriceList[0].sellStateIds;
      delete updatedFormData.productPriceList[0].sellCityIds;
    }

    if (updatedFormData.productPriceList?.[0]?.sellType == "NORMALSELL") {
      updatedFormData.productPriceList[0].menuId = STORE_MENU_ID;
    }
    if (updatedFormData.productPriceList?.[0]?.sellType == "BUYGROUP") {
      updatedFormData.productPriceList[0].menuId = BUYGROUP_MENU_ID;
    }
    if (updatedFormData.isCustomProduct) {
      updatedFormData.productPriceList[0].menuId = FACTORIES_MENU_ID;
    }
    if (activeProductType == "R") {
      updatedFormData.productPriceList[0].menuId = RFQ_MENU_ID;
    }

    // delete updatedFormData.productLocationId;
    delete updatedFormData.productCountryId;
    delete updatedFormData.productStateId;
    delete updatedFormData.productCityId;
    delete updatedFormData.productTown;
    delete updatedFormData.productLatLng;
    delete updatedFormData.sellCountryIds;
    delete updatedFormData.sellStateIds;
    delete updatedFormData.sellCityIds;

    delete updatedFormData.setUpPrice;
    delete updatedFormData.productCondition;

    delete updatedFormData.isStockRequired;
    delete updatedFormData.isOfferPriceRequired;

    updatedFormData.skuNo = randomSkuNo;
    updatedFormData.offerPrice =
      activeProductType === "R"
        ? (updatedFormData.offerPrice ?? 0)
        : (updatedFormData.productPrice ?? 0);
    updatedFormData.productPrice =
      activeProductType === "R"
        ? (updatedFormData.offerPrice ?? 0)
        : (updatedFormData.productPrice ?? 0);

    // TODO: category input field change
    if (updatedFormData.categoryId === 0) {
      toast({
        title: t("product_create_failed"),
        description: t("please_select_category"),
        variant: "danger",
      });
      return;
    }

    (updatedFormData.description = updatedFormData?.descriptionJson
      ? JSON.stringify(updatedFormData?.descriptionJson)
      : ""),
      delete updatedFormData.descriptionJson;
    console.log(updatedFormData);

    updatedFormData.productVariant = updatedFormData.productVariants
      .filter((el: any) => el.value?.trim())
      .map((el: any) => {
        return {
          type: updatedFormData.productVariantType,
          value: el.value,
        };
      });

    const productVariantImages = updatedFormData.productVariants
      .filter((item: any) => item.image)
      .map((item: any, index: number) => {
        return { path: item.image, id: index.toString() };
      });
    if (productVariantImages.length > 0) {
      const productVariantImagesArray =
        await handleUploadedFile(productVariantImages);
      if (productVariantImagesArray) {
        updatedFormData.productImagesList = [
          ...updatedFormData.productImagesList,
          ...updatedFormData.productVariants
            .filter((item: any) => item.image && item.value)
            .map((item: any, index: number) => {
              const url = productVariantImagesArray[index];
              const extension = url.split(".").pop()?.toLowerCase();

              if (extension) {
                if (imageExtensions.includes(extension)) {
                  const imageName: string = url.split("/").pop()!;
                  return {
                    image: url,
                    imageName,
                    variant: {
                      type: updatedFormData.productVariantType,
                      value: item.value,
                    },
                  };
                }
              }

              return {
                image: url,
                imageName: url,
                variant: {
                  type: updatedFormData.productVariantType,
                  value: item.value,
                },
              };
            }),
        ];
      }
    }

    delete updatedFormData.productVariantType;
    delete updatedFormData.productVariants;

    const response = await createProduct.mutateAsync(updatedFormData);

    if (response.status && response.data) {
      toast({
        title: t("product_create_successful"),
        description: response.message,
        variant: "success",
      });
      form.reset();
      if (activeProductType === "R") {
        router.push("/rfq");
      } else if (activeProductType === "F") {
        router.push("/factories");
      } else {
        router.push("/manage-products");
      }
    } else {
      toast({
        title: t("product_create_failed"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    if (!watchSetUpPrice) {
      form.setValue("productPrice", 0);
      form.setValue("offerPrice", 0);
      form.setValue("productPriceList", [
        {
          consumerType: "",
          sellType: "",
          consumerDiscount: 0,
          vendorDiscount: 0,
          consumerDiscountType: "",
          vendorDiscountType: "",
          minCustomer: 0,
          maxCustomer: 0,
          minQuantityPerCustomer: 0,
          maxQuantityPerCustomer: 0,
          minQuantity: 0,
          maxQuantity: 0,
          dateOpen: "",
          dateClose: "",
          timeOpen: 0,
          timeClose: 0,
          startTime: "",
          endTime: "",
          deliveryAfter: 0,
          stock: 0,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSetUpPrice, form.setValue]);

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    let activeProductType = params.get("productType");

    if (activeProductType) {
      setActiveProductType(activeProductType);
    }
  }, []);

  return (
    <>
      <section className="relative w-full py-7">
        <div className="absolute left-0 top-0 -z-10 h-full w-full">
          <Image
            src={BackgroundImage}
            className="h-full w-full object-cover object-center"
            alt="background"
            fill
            priority
          />
        </div>
        <div className="container relative z-10 m-auto mx-auto max-w-[950px] px-3">
          <div className="flex flex-wrap">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <BasicInformationSection
                  tagsList={memoizedTags}
                  activeProductType={activeProductType}
                  selectedCategoryIds={selectedCategoryIds}
                />

                {/* <ProductDetailsSection /> */}

                <div className="grid w-full grid-cols-4 gap-x-5">
                  <div className="col-span-4 mb-3 w-full rounded-lg border border-solid border-gray-300 bg-white p-2 shadow-sm sm:p-3 lg:p-4">
                    <div className="form-groups-common-sec-s1">
                      <DescriptionAndSpecificationSection />
                      <div className="mb-4 mt-4 inline-flex w-full items-center justify-end gap-2">
                        <button
                          className="rounded-sm bg-transparent px-2 py-2 text-sm font-bold leading-6 text-[#7F818D] md:px-4 md:py-4 md:text-lg"
                          dir={langDir}
                          translate="no"
                        >
                          {t("save_as_draft")}
                        </button>

                        <Button
                          disabled={
                            createProduct.isPending || uploadMultiple.isPending
                          }
                          type="submit"
                          className="h-10 rounded bg-dark-orange px-6 text-center text-sm font-bold leading-6 text-white hover:bg-dark-orange hover:opacity-90 md:h-12 md:px-10 md:text-lg"
                          dir={langDir}
                          translate="no"
                        >
                          {createProduct.isPending ||
                            uploadMultiple.isPending ? (
                            <LoaderWithMessage message={t("please_wait")} />
                          ) : (
                            t("continue")
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CreateProductPage;
