import { useEffect, useMemo, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form, Row, Col } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFetchProductById,
  useUpdateProduct,
} from "../../../apis/queries/products.queries";
import Select from "react-select";
import { useBrandsByType } from "../../../apis/queries/brand.queries";
import {
  useCountries,
  useGetAllCountries,
  useGetAllStates,
  useGetCities,
} from "../../../apis/queries/masters.queries";
import {
  useSubCategoryById,
} from "../../../apis/queries/category.queries";
import { useUploadFile } from "../../../apis/queries/upload.queries";
import { toast } from "react-toastify";
import { fetchSubCategoriesById } from "../../../apis/requests/category.requests";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import ShortDescriptionSection from "./ShortDescriptionSection";
import SpecificationSection from "./SpecificationSection";
import ControlledRichTextEditor from "../../shared/Forms/ControlledRichTextEditor";
import {
  handleDescriptionParse,
  isImage,
  isVideo,
} from "../../../utils/helper";
import AddImageContent from "../../AddImageContent";
import ReactPlayer from "react-player/lazy";
import { IoIosCloseCircle } from "react-icons/io";
import { imageExtensions, videoExtensions } from "../../../utils/constants";

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

const formSchema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  categoryId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable()
    .required("Product Category is required"),
  categoryLocation: yup.string().trim().optional(),
  brandId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable()
    .required("Brand is required"),
  skuNo: yup.string().required("SKU No. is required"),
  productTagList: yup
    .array()
    .required("Product tag is required")
    .transform((value) => {
      return value?.map((item: { value: number }) => ({
        tagId: item.value,
      }));
    }),
  productImagesList: yup.mixed().optional(),
  // productPrice: yup.number().required("Product price is required"),
  // offerPrice: yup.number().required("Offer price is required"),
  placeOfOriginId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable()
    .required("Place of Origin is required"),
  productShortDescriptionList: yup.array().of(
    yup.object({
      shortDescription: yup
        .string()
        .trim()
        .required("Short description is required"),
    })
  ),
  productSpecificationList: yup.array().of(
    yup.object({
      label: yup.string().trim().required("Label is required"),
      specification: yup.string().trim().required("Specification is required"),
    })
  ),
  description: yup.string(),
  productImages: yup.mixed(),
  productCountryId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable(),
  productStateId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable(),
  productCityId: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable(),
  descriptionJson: yup.array().optional(),
});

type ProductFormProps = {
  productId?: number;
  productCategories: any[];
  show: boolean;
  onHide: () => void;
};

const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  productCategories,
  onHide,
  show,
  ...props
}) => {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      productName: "",
      categoryId: 0,
      categoryLocation: "",
      skuNo: "",
      productTagList: undefined,
      productImagesList: undefined,
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
      productImages: [] as { path: File; id: string }[],
      productCountryId: 0,
      productStateId: 0,
      productCityId: 0
    },
  });

  const [product, setProduct] = useState<any>();
  const [selectedProductCountryId, setSelectedProductCountryId] = useState<number>();
  const [selectedProductStateId, setSelectedProductStateId] = useState<number>();
  const [listIds, setListIds] = useState<any>([]);
  const [catList, setCatList] = useState<any>([]);
  const [currentId, setCurrentId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const photosRef = useRef<HTMLInputElement>(null);

  const upload = useUploadFile();
  const brandsQuery = useBrandsByType(product?.typeOfProduct, {
    addedBy: product?.adminId
  }, !!product?.id);
  const countriesQuery = useCountries();
  const allCountriesQuery = useGetAllCountries();
  const statesQuery = useGetAllStates({
    countryId: selectedProductCountryId,
    enabled: !!selectedProductCountryId
  });
  const citiesQuery = useGetCities({
    stateId: form.getValues("productStateId"),
    enabled: !!form.getValues("productStateId")
  });
  const updateProduct = useUpdateProduct();
  const productQueryById = useFetchProductById(
    productId || 0,
    !!productId
  );
  const subCategoryById = useSubCategoryById(currentId, !!currentId);

  const watchProductImages = form.watch("productImages");

  const memoizedBrands = useMemo(() => {
    return (
      brandsQuery?.data?.data.map((item: { brandName: string; id: number }) => {
        return { label: item.brandName, value: item.id };
      }) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    brandsQuery?.data?.data, 
    brandsQuery?.data?.data?.length, 
    product?.id, 
    product?.typeOfProduct,
    product?.adminId
  ]);

  const memoizedCountries = useMemo(() => {
    return (
      countriesQuery?.data?.data.map(
        (item: { countryName: string; id: number }) => {
          return { label: item.countryName, value: item.id };
        }
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countriesQuery?.data?.data, countriesQuery?.data?.data?.length]);

  const memoizedAllCountries = useMemo(() => {
    return (
      allCountriesQuery?.data?.data.map(
        (item: { name: string; id: number }) => {
          return { label: item.name, value: item.id };
        }
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCountriesQuery?.data?.data, countriesQuery?.data?.data?.length]);

  const memoizedStates = useMemo(() => {
    return (
      statesQuery?.data?.data.map(
        (item: any) => {
          return { label: item.name, value: item.id };
        }
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statesQuery?.data?.data,
    statesQuery?.data?.data?.length,
    selectedProductCountryId,
  ]);

  useEffect(() => {
    if (selectedProductCountryId) {
      queryClient.invalidateQueries({ queryKey: ["allstates"] });
    }
  }, [selectedProductCountryId]);

  const memoizedCities = useMemo(() => {
    if (!form.getValues("productStateId")) return [];

    return (
      citiesQuery?.data?.data.map(
        (item: any) => {
          return { label: item.name, value: item.id };
        }
      ) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    citiesQuery?.data?.data, 
    citiesQuery?.data?.data?.length,
    selectedProductStateId
  ]);

  useEffect(() => {
    if (selectedProductStateId) {
      queryClient.invalidateQueries({ queryKey: ["allcities"] });
    }
  }, [selectedProductStateId]);

  const handleEditPreviewImage = (id: string, item: FileList) => {
    const tempArr = watchProductImages || [];
    const filteredFormItem = tempArr.filter((item: any) => item?.id === id);
    if (filteredFormItem.length) {
      filteredFormItem[0].path = item[0];
      form.setValue("productImages", [...tempArr]);
    }
  };

  const handleRemovePreviewImage = (id: string) => {
    form.setValue("productImages", [
      ...(watchProductImages || []).filter((item: any) => item?.id !== id),
    ]);
  };

  const handleUploadedFile = async (files: FileList) => {
    if (files) {
      const formData = new FormData();
      formData.append("content", files[0]);
      const response = await upload.mutateAsync(formData);
      if (response.status && response.data) {
        return response.data;
      }
    }
  };

  const onSubmit = async (formData: any) => {
    const updatedFormData = { ...formData };
    if (watchProductImages.length) {
      const fileTypeArrays = watchProductImages.filter(
        (item: any) => typeof item.path === "object"
      );

      const imageUrlArray: any = fileTypeArrays?.length
        ? await handleUploadedFile(fileTypeArrays)
        : [];

      const stringTypeArrays = watchProductImages
        .filter((item: any) => typeof item.path !== "object")
        .map((item: any) => {
          const extension = item.path.split(".").pop()?.toLowerCase();

          if (extension) {
            if (videoExtensions.includes(extension)) {
              const videoName: string = item?.path.split("/").pop()!;
              return {
                video: item?.path,
                videoName,
              };
            } else if (imageExtensions.includes(extension)) {
              const imageName: string = item?.path.split("/").pop()!;
              return {
                image: item?.path,
                imageName,
              };
            }
          }
        });

      const formattedimageUrlArrays = imageUrlArray?.map((item: any) => {
        const extension = item.split(".").pop()?.toLowerCase();

        if (extension) {
          if (videoExtensions.includes(extension)) {
            const videoName: string = item.split("/").pop()!;
            return {
              video: item,
              videoName,
            };
          } else if (imageExtensions.includes(extension)) {
            const imageName: string = item.split("/").pop()!;
            return {
              image: item,
              imageName,
            };
          }
        }

        return {
          image: item,
          imageName: item,
        };
      });

      updatedFormData.productImages = [
        ...stringTypeArrays,
        ...formattedimageUrlArrays,
      ];

      if (updatedFormData.productImages.length) {
        updatedFormData.productImagesList = updatedFormData.productImages;
      }
    }

    delete updatedFormData.productImages;

    if (productId) {
      updatedFormData.description = updatedFormData?.descriptionJson
        ? JSON.stringify(updatedFormData?.descriptionJson)
        : "";
      delete updatedFormData.descriptionJson;

      const response = await updateProduct.mutateAsync({
        ...updatedFormData,
        productId: Number(productId),
      });
      if (response.status && response.data) {
        toast.success("Product updated successfully");
        form.reset({
          productName: "",
          categoryId: 0,
          categoryLocation: "",
          skuNo: "",
          productTagList: undefined,
          productImagesList: undefined,
          description: "",
          productImages: [],
        });

        queryClient.invalidateQueries({
          queryKey: ["product-by-id", productId],
        });

        onHide();
      } else {
        toast.error(response.message);
      }
    }
  };

  useEffect(() => {
    if (productQueryById?.data?.data) {
      const product = productQueryById?.data?.data;

      setProduct(product);

      const productTagList = product?.productTags
        ? product?.productTags?.map(
            (item: { productTagsTag: { tagName: string; id: number } }) => {
              return {
                label: item?.productTagsTag?.tagName,
                value: item?.productTagsTag?.id,
              };
            }
          )
        : [];

      const productImages = product?.productImages?.length
        ? product?.productImages?.map(
            (item: { image: string; imageName: string }) => {
              return {
                path: item?.image,
                id: item?.imageName,
              };
            }
          )
        : [
            {
              path: "",
              id: uuidv4(),
            },
          ];

      const productImagesList = product?.productImages
        ? product?.productImages?.map(
            (item: { image: string; imageName: string }) => {
              return {
                imageName: item?.image,
                image: item?.imageName,
              };
            }
          )
        : undefined;

      const productShortDescriptionList = product
        ?.product_productShortDescription?.length
        ? product?.product_productShortDescription.map(
            (item: { shortDescription: string }) => ({
              shortDescription: item?.shortDescription,
            })
          )
        : [
            {
              shortDescription: "",
            },
          ];

      const productSpecificationList = product?.product_productSpecification
        ?.length
        ? product?.product_productSpecification.map(
            (item: { label: string; specification: string }) => ({
              label: item?.label,
              specification: item?.specification,
            })
          )
        : [
            {
              label: "",
              specification: "",
            },
          ];

      form.reset({
        productName: product?.productName,
        categoryId: product?.categoryId,
        categoryLocation: product?.categoryLocation
          ? product?.categoryLocation
          : "",
        brandId: product?.brandId,
        skuNo: product?.skuNo,
        productTagList: productTagList || undefined,
        productImages: productImages || [
          {
            path: "",
            id: uuidv4(),
          },
        ],
        productImagesList: productImagesList || undefined,
        productCountryId: product?.product_productPrice?.[0]?.productCountryId,
        productStateId: product?.product_productPrice?.[0]?.productStateId,
        productCityId: product?.product_productPrice?.[0]?.productCityId,
        placeOfOriginId: product?.placeOfOriginId,
        productShortDescriptionList: productShortDescriptionList,
        productSpecificationList: productSpecificationList,
        description: product?.description,
        descriptionJson: product?.description
          ? handleDescriptionParse(product?.description)
          : undefined,
      });

      setSelectedProductCountryId(product?.product_productPrice?.[0]?.productCountryId);
      setSelectedProductStateId(product?.product_productPrice?.[0]?.productStateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productQueryById?.data?.data]);

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

  useEffect(() => {
    if (form.getValues("categoryLocation")) {
      const tempArr: string[] | undefined = form
        .getValues("categoryLocation")
        ?.split(",");

      const index = (tempArr?.length || 0) - 1;
      const promises: Promise<any>[] | undefined = tempArr
        ?.slice(0, index > 0 ? index : 1)
        .map(async (categoryId) => {
          const res = await fetchSubCategoriesById({ categoryId });
          return res.data?.data;
        });

      if (!promises) return;

      Promise.all(promises).then((values) => {
        setListIds(tempArr);
        setCatList(values);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!form.getValues("categoryLocation")]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => form.setValue("categoryId", Number(currentId)), [currentId]);

  useEffect(
    () => form.setValue("categoryLocation", listIds.join(",")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listIds, listIds?.length]
  );

  return (
    <Modal
      {...props}
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      className="customModal4 w710px body-lrp-equal"
      centered
      backdrop="static"
      animation={false}
    >
      <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <Modal.Header>
            <h5 id="contained-modal-title-vcenter">Edit Product</h5>
            <button
              type="button"
              className="customModal4-close"
              onClick={() => {
                onHide();
                form.reset({
                  categoryLocation: "",
                });
              }}
            >
              <img src="/images/close.svg" alt="close-icon" />
            </button>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <Form.Group className="flex flex-col">
                  <Form.Label htmlFor="categoryId">Product Category</Form.Label>
                  <Controller
                    name="categoryId"
                    control={form.control}
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
                      >
                        <option value="">Select Category</option>
                        {productCategories.map((item: any) => (
                          <option
                            value={item.value?.toString()}
                            key={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.categoryId?.message}
                  </p>
                </Form.Group>
              </Col>
            </Row>

            {catList.length > 0 &&
              catList.map((item: any, index: number) => (
                <div
                  key={item?.id}
                  className="mb-3 grid w-full grid-cols-1 gap-x-5 gap-y-3"
                >
                  <div className="flex w-full flex-col justify-between gap-y-2">
                    <label className="mb-[6px]">Sub Category</label>
                    <select
                      className="!h-[48px] w-full rounded border !border-gray-300 px-3 text-sm focus-visible:!ring-0"
                      onChange={(e) => {
                        if (e.target.value === "") {
                          return;
                        }

                        setCurrentId(e.target.value);
                        setCurrentIndex(index + 1);

                        if (listIds[index + 1]) {
                          let tempIds = listIds;
                          tempIds[index + 1] = e.target.value;
                          tempIds = tempIds.slice(0, index + 2);
                          setListIds([...tempIds]);
                          return;
                        }
                        setListIds([...listIds, e.target.value]);
                      }}
                      value={item?.children
                        ?.find(
                          (item: {
                            id?: string;
                            name?: string;
                            children?: any[];
                          }) =>
                            listIds.includes(item?.id?.toString()) ? item : ""
                        )
                        ?.id?.toString()}
                    >
                      <option value="">Select Sub Category</option>
                      {item?.children?.map((item: any) => (
                        <option value={item.id?.toString()} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

            <Form.Group>
              <Form.Label htmlFor="productName">Product Name</Form.Label>
              <Form.Control
                type="text"
                id="productName"
                {...form.register("productName")}
                placeholder="Enter Product Name"
              />
              <p className="text-red-500 text-sm">
                {form.formState.errors?.productName?.message}
              </p>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="brandId">Brand</Form.Label>
                  <Controller
                    name="brandId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={memoizedBrands.find(
                          (c: any) => c.value === field.value
                        )}
                        onChange={(e) => field.onChange(e.value)}
                        placeholder="Select Brand"
                        options={memoizedBrands}
                        styles={customStyles}
                      />
                    )}
                  />

                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.brandId?.message}
                  </p>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="skuNo">SKU No</Form.Label>
                  <Form.Control
                    type="text"
                    id="skuNo"
                    {...form.register("skuNo")}
                    placeholder="Enter SKU No"
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.skuNo?.message}
                  </p>
                </Form.Group>
              </Col>
            </Row>

            {/* <Form.Group>
            <Form.Label htmlFor="productPrice">Tag</Form.Label>
            <Form.Control
              type="text"
              id="productPrice"
              {...form.register("productPrice")}
              placeholder="Product Price"
            />
            <p className="text-red-500 text-sm">
              {form.formState.errors?.productPrice?.message}
            </p>
          </Form.Group> */}

            <div className="mb-4">
              <Form.Label htmlFor="productImages">Product Images</Form.Label>

              <div className="flex w-full flex-wrap">
                <div className="grid grid-cols-3">
                  {watchProductImages?.map((item: any, index: number) => (
                    <Controller
                      control={form.control}
                      name="productImages"
                      key={index}
                      render={({ field }) => (
                        <div className="relative mb-3 w-full px-2">
                          <div className="relative m-auto flex h-48 w-full flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                            {watchProductImages?.length ? (
                              <button
                                type="button"
                                className="absolute z-[2] border border-#DB2302 bg-#DB2302 cursor-pointer flex justify-center items-center rounded-[50%] border-solid right-[3px] top-[3px]"
                                onClick={() => {
                                  handleRemovePreviewImage(item?.id);
                                  if (photosRef.current)
                                    photosRef.current.value = "";
                                }}
                              >
                                <IoIosCloseCircle size={22} color="#DB2302" />
                              </button>
                            ) : null}
                            {item?.path && isImage(item.path) ? (
                              <div className="relative h-44 w-44">
                                <img
                                  src={
                                    typeof item.path === "object"
                                      ? URL.createObjectURL(item.path)
                                      : typeof item.path === "string"
                                      ? item.path
                                      : NoImagePlaceholder
                                  }
                                  className="h-full w-full rounded-lg"
                                  alt="profile"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple={false}
                                  className="absolute !top-0 left-0 h-44 w-44 cursor-pointer opacity-0"
                                  onChange={(event) => {
                                    if (event.target.files) {
                                      if (
                                        event.target.files[0].size > 524288000
                                      ) {
                                        toast.error(
                                          "One of your file size should be less than 500MB"
                                        );
                                        return;
                                      }
                                      handleEditPreviewImage(
                                        item?.id,
                                        event.target.files
                                      );
                                    }
                                  }}
                                  id="productImages"
                                />
                              </div>
                            ) : item?.path && isVideo(item.path) ? (
                              <div className="relative h-44">
                                <div className="player-wrapper px-2">
                                  <ReactPlayer
                                    url={
                                      typeof item.path === "object"
                                        ? URL.createObjectURL(item.path)
                                        : typeof item.path === "string"
                                        ? item.path
                                        : NoImagePlaceholder
                                    }
                                    width="100%"
                                    height="100%"
                                    // playing
                                    controls
                                  />
                                </div>

                                <div className="absolute h-14 w-full px-2 py-3">
                                  <p className="rounded-lg border border-gray-300 bg-gray-100 py-2 text-sm font-semibold">
                                    Upload Video
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept="video/*"
                                  multiple={false}
                                  className="!bottom-0 h-14 !w-full cursor-pointer opacity-0"
                                  onChange={(event) => {
                                    if (event.target.files) {
                                      if (
                                        event.target.files[0].size > 524288000
                                      ) {
                                        toast.error(
                                          "One of your file size should be less than 500MB"
                                        );
                                        return;
                                      }

                                      handleEditPreviewImage(
                                        item?.id,
                                        event.target.files
                                      );
                                    }
                                  }}
                                  id="productImages"
                                />
                              </div>
                            ) : (
                              <AddImageContent description="Drop your File , or " />
                            )}
                          </div>
                        </div>
                      )}
                    />
                  ))}
                  <div className="relative mb-3 w-full pl-2">
                    <div className="absolute m-auto flex h-48 w-full cursor-pointer flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-center">
                      <div className="text-sm font-medium leading-4 text-color-dark">
                        <img
                          src="/images/plus.png"
                          className="m-auto mb-3"
                          alt="camera-icon"
                          width={29}
                          height={28}
                        />
                        <span>Add More</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*, video/*"
                      multiple
                      className="!bottom-0 h-48 !w-full cursor-pointer opacity-0"
                      onChange={(event) => {
                        if (event.target.files) {
                          const filesArray = Array.from(event.target.files);
                          if (
                            filesArray.some((file) => file.size > 524288000)
                          ) {
                            toast.error(
                              "One of your image size should be less than 500MB"
                            );
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

                          form.setValue("productImages", updatedProductImages);
                        }
                      }}
                      id="productImages"
                      ref={photosRef}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="productCountryId">
                    Product Country
                  </Form.Label>
                  <Controller
                    name="productCountryId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={memoizedAllCountries.find(
                          (c: any) => c.value === field.value
                        )}
                        onChange={(e) => {
                          field.onChange(e?.value);
                          form.setValue("productStateId", null);
                          form.setValue("productCityId", null);
                          setSelectedProductCountryId(e?.value);
                          setSelectedProductStateId(undefined);
                        }}
                        placeholder="Select Product Country"
                        options={memoizedAllCountries}
                        styles={customStyles}
                      />
                    )}
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.productCountryId?.message}
                  </p>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="productStateId">
                    Product State
                  </Form.Label>
                  <Controller
                    name="productStateId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={memoizedStates.find(
                          (c: any) => c.value === field.value
                        ) || ""}
                        onChange={(e) => {
                          field.onChange(e?.value);
                          setSelectedProductStateId(e?.value);
                          form.setValue("productCityId", null);
                        }}
                        placeholder="Select Product State"
                        options={memoizedStates}
                        styles={customStyles}
                      />
                    )}
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.productStateId?.message}
                  </p>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="productCityId">
                    Product City
                  </Form.Label>
                  <Controller
                    name="productCityId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={memoizedCities.find(
                          (c: any) => c.value === field.value
                        ) || ""}
                        onChange={(e) => field.onChange(e?.value)}
                        placeholder="Select Product City"
                        options={memoizedCities}
                        styles={customStyles}
                        isClearable={true}
                      />
                    )}
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.productCityId?.message}
                  </p>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor="placeOfOriginId">
                    Place of Origin
                  </Form.Label>
                  <Controller
                    name="placeOfOriginId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={memoizedCountries.find(
                          (c: any) => c.value === field.value
                        )}
                        onChange={(e) => field.onChange(e.value)}
                        placeholder="Select Place of Origin"
                        options={memoizedCountries}
                        styles={customStyles}
                      />
                    )}
                  />
                  <p className="text-red-500 text-sm">
                    {form.formState.errors?.placeOfOriginId?.message}
                  </p>
                </Form.Group>
              </Col>
            </Row>

            <ShortDescriptionSection />

            <Form.Group>
              <ControlledRichTextEditor
                label="Description"
                name="descriptionJson"
              />
            </Form.Group>

            <SpecificationSection />
          </Modal.Body>
          <Modal.Footer>
            <div className="modal-form-submit-actions">
              <Button
                variant="dark"
                size="sm"
                onClick={() => {
                  onHide();
                  form.reset({
                    categoryLocation: "",
                  });
                }}
                className="cancel-btn"
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                className="save-btn"
                disabled={updateProduct.isPending}
              >
                Edit
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </FormProvider>
    </Modal>
  );
};

export default ProductForm;
