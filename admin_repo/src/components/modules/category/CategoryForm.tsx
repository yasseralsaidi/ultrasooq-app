import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { IoIosCloseCircle } from "react-icons/io";
import { useCategories, useCategoryById, useCreateMultipleCategory, useDeleteCategory, useUpdateCategory, useUpdateWhiteBlackList, } from "../../../apis/queries/category.queries";
import { useQueryClient } from "@tanstack/react-query";
import { 
  BUSINESS_TYPE_CATEGORY_ID, 
  CATEGORY_TYPE, 
  PRODUCT_CATEGORY_ID, 
  SERVICE_CATEGORY_ID 
} from "../../../utils/constants";
import { toast } from "react-toastify";
import { Item } from "../../../utils/types/common.types";
import { useUploadFile } from "../../../apis/queries/upload.queries";
import { MdOutlineImageNotSupported } from "react-icons/md";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import classNames from "classnames";
import api from "../../../services/Axios";

type CategoryFormProps = {
  isVisible: boolean;
  onClose: () => void;
  categoryId?: string;
  categoryType?: string;
  fullCategoryList?: any;
};

const CategoryForm: React.FC<CategoryFormProps> = ({ isVisible = false, onClose = () => { }, categoryId = "", categoryType = "", fullCategoryList, }) => {
  const queryClient = useQueryClient();
  const form = useForm({ mode: "all", defaultValues: { categoryName: "", subCategories: [], connectTo: [], whitelist: [], blacklistTo: [], subCategory: "", iconImage: "", mainIconImage: "", }, });
  const [addToList, setAddToList] = useState();

  const watchSubCategories = form.watch("subCategories");
  const watchIconImage = form.watch("iconImage");
  const watchMainIconImage = form.watch("mainIconImage");

  const categoryQueryById = useCategoryById(String(categoryId), !!categoryId);
  const createMultipleCategory = useCreateMultipleCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateWhiteBlackList = useUpdateWhiteBlackList();
  const upload = useUploadFile();

  const handleBadgeAdd = (name: any) => {
    if (!addToList) return;
    form.setValue(name, [...form.getValues(name), { id: uuidv4(), name: addToList, icon: watchIconImage },]);
    setAddToList(undefined);
    form.setValue("iconImage", "");
    form.setValue("subCategory", "");
  };

  const handleInputKeyPress = (e: any, name: any) => {
    if (!e.target.value) return;

    if (e.key === "Enter") {
      e.preventDefault();

      form.setValue(name, [...form.getValues(name), { id: uuidv4(), name: e.target.value },]);
      e.target.value = "";
    }
  };

  const handleBadgeRemove = async (indexToRemove: any, name: any, list: any) => {
    if (typeof indexToRemove === "string") {
      form.setValue(name, list?.filter((item: any) => item?.id !== indexToRemove));
    } else {
      const response = await deleteCategory.mutateAsync(String(indexToRemove));
      if (response?.status) {
        toast.success("Sub category deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["category-by-id", categoryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });
        categoryQueryById.refetch();
      }
    }
  };

  const handleCategoryName = async () => {
    const name = form.getValues("categoryName");
    const mainIconImage = form.getValues("mainIconImage");
    const response = await updateCategory.mutateAsync({ categoryId, name, icon: mainIconImage ? mainIconImage : undefined, });
    if (response?.status) {
      toast.success("Category name updated successfully");
      form.setValue("categoryName", "");
      form.setValue("subCategories", []);
      form.setValue("mainIconImage", "");
      queryClient.invalidateQueries({ queryKey: ["category-by-id", categoryId], });
      categoryQueryById.refetch();
      onClose();
    }
  };

  const handleSubCategory = async () => {
    const subCategories = form.getValues("subCategories")?.filter((item: any) => typeof item?.id === "string");

    if (!subCategories?.length) {
      return;
    }

    if (!categoryQueryById.data?.data) {
      return;
    }

    const index = CATEGORY_TYPE.findIndex((item) => item === categoryQueryById.data?.data?.type);

    const data = {
      parentId: categoryQueryById.data?.data?.id,
      menuId: categoryQueryById.data?.data?.menuId,
      type: CATEGORY_TYPE[index + 1] || "CATEGORY",
      categoryList: subCategories.map((item: { name: string; icon: string }) => ({ name: item.name, icon: item.icon, })),
    };

    // return;
    const response = await createMultipleCategory.mutateAsync(data);
    if (response?.status) {
      toast.success("Sub category created successfully");
      form.setValue("categoryName", "");
      form.setValue("subCategories", []);
      queryClient.invalidateQueries({ queryKey: ["category-by-id", categoryId], });
      queryClient.invalidateQueries({ queryKey: ["categories"], });
      categoryQueryById.refetch();
      onClose();
    }
  };

  const handleWhiteBlackListChange = async (subCategory: any, listType: any) => {
    // listType = whiteList or blackList
    const temp = { id: subCategory?.id, status: subCategory?.[listType] === "YES" ? "NO" : "YES", };

    const data = { [listType]: [temp], };

    const response = await updateWhiteBlackList.mutateAsync(data);

    if (response?.status) {
      toast.success("List updated successfully");
      queryClient.invalidateQueries({ queryKey: ["category-by-id", categoryId], });
      categoryQueryById.refetch();
    }
  };

  const onSubmit = (data: any) => {
    console.log(data);
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

  const handleFileChanges = async (event: any) => {
    if (event.target.files?.[0]) {
      if (event.target.files[0].size > 52428800) {
        toast.error("Image size should be less than 50MB");
        return;
      }
      const response = await handleUploadedFile(event.target.files);
      form.setValue("iconImage", response);
      // return;
    }
  };

  const handleMainFileChanges = async (event: any) => {
    if (event.target.files?.[0]) {
      if (event.target.files[0].size > 52428800) {
        toast.error("Image size should be less than 50MB");
        return;
      }

      const response = await handleUploadedFile(event.target.files);
      form.setValue("mainIconImage", response);
    }
  };

  useEffect(() => {
    if (categoryQueryById.data?.data) {
      const subCategoryList = categoryQueryById.data?.data?.children?.map((item: any) => ({ id: item?.id, name: item?.name, whiteList: item?.whiteList || "NO", blackList: item?.blackList || "NO", icon: item?.icon, }));
      form.setValue("categoryName", categoryQueryById.data?.data?.name);
      form.setValue("mainIconImage", categoryQueryById.data?.data?.icon);
      form.setValue("subCategories", subCategoryList);
      setExistingConnection({})
      setCategorySelect([])
      setActiveAccordionIds([])
      categoryQueryById?.data?.data?.category_categoryIdDetail.forEach((element: any) => {
        setCategorySelect((pre) => [...pre, element.connectTo])
        setExistingConnection((pre) => ({ ...pre, [element.connectTo]: element.id }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryQueryById.data?.data?.name, categoryQueryById.data?.data?.children?.length, categoryId,]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const extractCategories = (items: any[], ids: number[], extracted: any[] = []) => {
    for (let item of items) {
      if (ids.includes(item.id)) {
        extracted.push(item);
      } else if (item?.children?.length) {
        extractCategories(item.children, ids, extracted);
      }
    }

    return extracted;
  };

  const findPathById = useMemo(() => (item: Item, id: string, path: string[] = []) => {
    const newPath: string[] = [...path, item?.name];

    if (item?.id === id) {
      return newPath.join("/");
    }

    if (item?.children && item?.children.length > 0) {
      for (const child of item.children) {
        const result: any = findPathById(child, id, newPath);
        if (result) {
          return result;
        }
      }
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCategoryList, categoryId]);

  const findPath = useMemo(() => (item: Item, id: string | number, path: string[] = []) => {
    const newPath: string[] = [...path, item?.id];

    if (item?.id === id) {
      return newPath.join(",");
    }

    if (item?.children && item?.children.length > 0) {
      for (const child of item.children) {
        const result: any = findPath(child, id, newPath);
        if (result) {
          return result;
        }
      }
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCategoryList, categoryId]);

  const locationPath = findPathById(fullCategoryList || [], categoryId);
  const location = findPath(fullCategoryList || [], categoryId);

  const [categorySelect, setCategorySelect] = useState<number[]>([])
  const [existingConnection, setExistingConnection] = useState<{ [x: string]: string }>({})

  const getCategory = (categoryId: string) => {
    return new Promise<Item>((resolve, reject) => {
      api.get("/category/findOne", { params: { categoryId } }).then((response) => {
        if (response.data.status) {
          resolve(response.data.data)
        } else {
          reject(response.data);
        }
      }).catch((error) => {
        reject(error)
      })
    })
  }

  const handleConnectionRemove = async (connectionId: string) => {
    return new Promise<Item>((resolve, reject) => {
      api.delete(`/category/deleteCategoryConnectTo/${connectionId}`).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        reject(error);
      });
    })
  };

  const findChildren = (item: Item) => {
    if (!categorySelect.includes(Number(item.id))) {
      setCategorySelect((pre) => [...pre, Number(item.id)])
    }
    if (item?.children && item?.children.length > 0) {
      for (const child of item.children) {
        if (child?.children && child?.children?.length > 0) {
          findChildren(child)
        } else {
          if (!categorySelect.includes(Number(child.id))) {
            setCategorySelect((pre) => [...pre, Number(child.id)])
          }
        }
      }
    }
  }

  const removeChildren = (item: Item) => {
    if (existingConnection[item.id]) {
      handleConnectionRemove(existingConnection[item.id]).then(() => {
        setCategorySelect((pre) => pre.filter((id: number) => id !== Number(item.id)))
        if (item?.children && item?.children.length > 0) {
          for (const child of item.children) {
            if (child?.children && child?.children?.length > 0) {
              removeChildren(child)
            } else {
              if (existingConnection[item.id]) {
                handleConnectionRemove(existingConnection[item.id]).then(() => {
                  setCategorySelect((pre) => pre.filter((id: number) => id !== Number(child.id)))
                })
              } else {
                setCategorySelect((pre) => pre.filter((id: number) => id !== Number(child.id)))
              }
            }
          }
        }
        toast.error('Category connection successfully removed')
      })
    } else {
      setCategorySelect((pre) => pre.filter((id: number) => id !== Number(item.id)))
      if (item?.children && item?.children.length > 0) {
        for (const child of item.children) {
          if (child?.children && child?.children?.length > 0) {
            removeChildren(child)
          } else {
            if (existingConnection[item.id]) {
              handleConnectionRemove(existingConnection[item.id]).then(() => {
                setCategorySelect((pre) => pre.filter((id: number) => id !== Number(child.id)))
              })
            } else {
              setCategorySelect((pre) => pre.filter((id: number) => id !== Number(child.id)))
            }
          }
        }
      }
    }
  }

  const toggleCategorySelect = (items: Item) => {
    if (categorySelect.includes(Number(items.id))) {
      removeChildren(items)
    } else {
      getCategory(items.id).then((response: Item) => {
        findChildren(response)
      })
    }
  }

  const addConnectionRelation = () => {
    const connectToList = categorySelect.map((element) => ({ connectTo: element, connectToLocation: findPath(fullCategoryList, element)?.replace('1,', ''), connectToType: "product" }))
    api.post("/category/createCategoryConnectTo", { categoryId, categoryLocation: findPath(fullCategoryList || [], categoryId)?.replace('1,', ''), connectToList }).then((response) => {
      if (response.data.status) {
        toast.success('Successfully updated category connection')
        categoryQueryById.refetch();
        setActiveAccordionIds([])
      } else {
        toast.error('Category connection process failed')
        console.log(response.data);
      }
    }).catch((error) => {
      toast.error('Category connection process failed')
      console.log(error);
    });
  }

  const [activeAccordionIds, setActiveAccordionIds] = useState<any>([]);

  const categoriesQuery = useCategories();

  const handleAccordion = (item: any) => {
    if (!item.children?.length) return;
    if (activeAccordionIds.includes(item.id)) {
      setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
    } else {
      setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
    }
  }

  const recursiveRenderList = (list: any, check: boolean = true) => {
    return list.map((item: any) => !check || (check && location?.search(String(item.id)) < 0) ? (
      <div key={item.id} className="category-nested-accordion-item cursor-pointer">
        <div className={classNames("category-accordion-header", activeAccordionIds.includes(item.id) ? " active" : "")}>
          <div className="lediv">
            <div className={classNames("div-li", !item.children?.length ? " no-child" : "")}>
              <div className="lediv">
                {!item.children?.length ? null : (<button className="func-btn" onClick={() => handleAccordion(item)}></button>)}
                <h5>{item.name}</h5>
              </div>
            </div>
          </div>
          <div className="rgdiv">
            <input type="checkbox" checked={categorySelect.includes(Number(item.id))} onChange={() => toggleCategorySelect(item)} />
          </div>
        </div>
        <div className="category-accordion-content">
          <div className="div-ul">
            {item.children?.length ? recursiveRenderList(item.children, check) : null}
          </div>
        </div>
      </div>
    ) : (
      ''
    ));
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <div className={isVisible ? "nested-category-right-panel show" : "nested-category-right-panel"}>
        <div className="header-part">
          <h5>Category</h5>
          <button type="button" className="close-btn" onClick={onClose}>
            <img src="/images/modaclosebtn.svg" alt="" />
          </button>
        </div>
        <div className="body-part">
          <div className="row">
            <div className="flex justify-center mb-4">
              <Controller control={form.control} name="mainIconImage" render={({ field }) => (
                <div className="relative w-48 h-48">
                  <div className="relative m-auto flex h-48 w-48 flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                    {
                      watchMainIconImage && watchMainIconImage !== "" ? (
                        <img src={watchMainIconImage || NoImagePlaceholder} alt="profile" className="h-[198px] w-48 rounded-lg" />
                      ) : (
                        <div className="absolute top-0 h-full text-sm font-medium leading-4 text-color-dark flex flex-col justify-center items-center">
                          <img src="/images/upload.png" className=" mb-4" alt="camera" />
                          <span>Drop your Image or </span>
                          <span className="text-blue-500">browse</span>
                          <p className="text-normal mt-2 text-xs leading-4 text-gray-300">
                            (.jpg or .png only. Up to 50mb)
                          </p>
                        </div>
                      )
                    }

                    <input type="file" accept="image/*" multiple={false} className="absolute top-0 h-[198px] w-full cursor-pointer opacity-0" onChange={(event) => handleMainFileChanges(event)} id="mainIconImage" />
                  </div>
                </div>
              )} />
            </div>

            <div className="col-12 col-md-12">
              <Form.Group>
                <Form.Label htmlFor="name">Category Name</Form.Label>
                <Form.Control type="text" id="categoryName"  {...form.register("categoryName")} placeholder="Enter Category Name" />
              </Form.Group>
            </div>
            <div className="col-12 col-md-12">
              <div className="form-group-multi-action-btns-inline">
                <button type="button" className="custom-btn" onClick={handleCategoryName} disabled={updateCategory.isPending}>
                  {
                    updateCategory.isPending ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : null
                  }
                  <span className="mx-2">Update</span>
                </button>
              </div>
            </div>
            <div className="col-12 col-md-12">
              <Form.Group>
                <Form.Label htmlFor="location">Location</Form.Label>
                <div className="location-path">
                  {locationPath?.split("/").slice(1).join("/")}
                </div>
              </Form.Group>
            </div>

            <div className="col-12 col-md-12 mb-3">
              <Form.Group>
                <div className="label-with-right-btn">
                  <Form.Label htmlFor="subCategory">Sub Category</Form.Label>
                  <div className="right-btn">
                    <button type="button" className="custom-btn" disabled={!watchSubCategories.length || createMultipleCategory.isPending} onClick={handleSubCategory}>
                      {
                        createMultipleCategory.isPending ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : null
                      }
                      <span>Add Sub Category</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <Controller control={form.control} name="iconImage" render={({ field }) => (
                    <div className="relative w-48 h-48">
                      <div className="relative m-auto flex h-48 w-48 flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                        {
                          watchIconImage && watchIconImage !== "" ? (
                            <img src={watchIconImage || NoImagePlaceholder} alt="profile" className="h-[198px] w-48 rounded-lg" />
                          ) : (
                            <div className="absolute top-0 h-full text-sm font-medium leading-4 text-color-dark flex flex-col justify-center items-center">
                              <img src="/images/upload.png" className=" mb-4" alt="camera" />
                              <span>Drop your Image or </span>
                              <span className="text-blue-500">browse</span>
                              <p className="text-normal mt-2 text-xs leading-4 text-gray-300">
                                (.jpg or .png only. Up to 50mb)
                              </p>
                            </div>
                          )
                        }

                        <input type="file" accept="image/*" multiple={false} className="absolute top-0 h-[198px] w-full cursor-pointer opacity-0" onChange={(event) => handleFileChanges(event)} id="iconImage" />
                      </div>
                    </div>
                  )} />
                </div>

                <div className="input-with-right-add-btn">
                  <Form.Control type="text" id="subCategory"  {...form.register("subCategory")} placeholder="Enter Sub Category" onKeyDown={(e: any) => handleInputKeyPress(e, "subCategories")} onChange={(e: any) => setAddToList(e.target.value)} />
                  <button type="button" className="add-btn" onClick={() => handleBadgeAdd("subCategories")}>
                    Add To Lists
                  </button>
                </div>
                <ul className="category-tag-preview-lists">
                  {
                    watchSubCategories?.map((subCategory: { id: string; name: string; icon: string; }) => (
                      <li key={subCategory?.id} className="category-tag-preview-list-col">
                        <div className="category-tag-preview-list-box">
                          {
                            subCategory?.icon ? (
                              <img src={subCategory?.icon} alt="category-icon" height={36} width={36} />
                            ) : (
                              <MdOutlineImageNotSupported size={36} />
                            )
                          }

                          <p>{subCategory?.name}</p>
                          <button type="button" onClick={() => handleBadgeRemove(subCategory?.id, "subCategories", watchSubCategories)} disabled={deleteCategory.isPending}>
                            {
                              deleteCategory.isPending ? (
                                <div className="spinner-grow spinner-grow-sm" role="status">
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <IoIosCloseCircle size={20} />
                              )
                            }
                          </button>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </Form.Group>
            </div>

            <div className="col-12 col-md-12 mb-3">
              <Form.Group>
                <div className="label-with-right-btn">
                  <Form.Label htmlFor="connectTo">Connect To</Form.Label>
                  <div className="right-btn">
                    <button type="button" className="custom-btn" disabled={categorySelect.length > 0 ? false : true} onClick={() => addConnectionRelation()}>
                      Update Relation
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="listingMain">
                    <div className="category-nested-accordions">
                      {categoriesQuery.data?.data?.children && categoriesQuery.data?.data?.children?.length ? recursiveRenderList(categoriesQuery.data?.data?.children) : null}
                    </div>
                  </div>
                </div>

                {(categoryType == "service" || categoryType == "business_type") && <div className="mb-2">
                  <div className="listingMain">
                    <div className="category-nested-accordions">
                      {categoriesQuery.data?.data?.children && categoriesQuery.data?.data?.children?.length ? recursiveRenderList(extractCategories(categoriesQuery.data?.data?.children, [PRODUCT_CATEGORY_ID]), false) : null}
                    </div>
                  </div>
                </div>}

                {(categoryType == "product" || categoryType == "business_type") && <div className="mb-2">
                  <div className="listingMain">
                    <div className="category-nested-accordions">
                      {categoriesQuery.data?.data?.children && categoriesQuery.data?.data?.children?.length ? recursiveRenderList(extractCategories(categoriesQuery.data?.data?.children, [SERVICE_CATEGORY_ID]), false) : null}
                    </div>
                  </div>
                </div>}

                {(categoryType == "product" || categoryType == "service") && <div className="mb-2">
                  <div className="listingMain">
                    <div className="category-nested-accordions">
                      {categoriesQuery.data?.data?.children && categoriesQuery.data?.data?.children?.length ? recursiveRenderList(extractCategories(categoriesQuery.data?.data?.children, [BUSINESS_TYPE_CATEGORY_ID]), false) : null}
                    </div>
                  </div>
                </div>}

                {/* <ul className="category-tag-preview-lists">
                  {
                    categoryQueryById?.data?.data?.category_categoryIdDetail?.map((connectDetails: { id: string, connectToDetail: { id: string; name: string; icon: string; } }) => (
                      <li key={connectDetails?.id} className="category-tag-preview-list-col">
                        <div className="category-tag-preview-list-box">
                          {
                            connectDetails?.connectToDetail?.icon ? (
                              <img src={connectDetails?.connectToDetail?.icon} alt="category-icon" height={36} width={36} />
                            ) : (
                              <MdOutlineImageNotSupported size={36} />
                            )
                          }

                          <p>{connectDetails?.connectToDetail?.name}</p>
                          <button type="button" onClick={() => handleConnectionRemove(connectDetails?.id)} disabled={removeConnectionLoading}>
                            {
                              removeConnectionLoading ? (
                                <div className="spinner-grow spinner-grow-sm" role="status">
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <IoIosCloseCircle size={20} />
                              )
                            }
                          </button>
                        </div>
                      </li>
                    ))
                  }

                  {
                    categorySelect?.map((connectDetails: Item) => (
                      <li key={connectDetails?.id} className="category-tag-preview-list-col">
                        <div className="category-tag-preview-list-box">
                          {
                            connectDetails?.icon ? (
                              <img src={connectDetails?.icon} alt="category-icon" height={36} width={36} />
                            ) : (
                              <MdOutlineImageNotSupported size={36} />
                            )
                          }

                          <p>{connectDetails?.name}</p>
                          <button type="button" onClick={() => handleRemove(connectDetails?.id)} disabled={removeConnectionLoading}>
                            {
                              removeConnectionLoading ? (
                                <div className="spinner-grow spinner-grow-sm" role="status">
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <IoIosCloseCircle size={20} />
                              )
                            }
                          </button>
                        </div>
                      </li>
                    ))
                  }
                </ul> */}
              </Form.Group>
            </div>

            <div className="col-12 col-md-12">
              <Form.Group>
                <div className="label-with-right-btn">
                  <Form.Label htmlFor="whitelist">Whitelist</Form.Label>
                </div>
                <ul className="category-tag-preview-lists mt-0">
                  {
                    watchSubCategories?.map((subCategory: { id: string; name: string; whiteList: string; }) => (
                      <li key={subCategory?.id} className="category-tag-preview-list-col">
                        <div className="category-tag-preview-list-box">
                          <p>{subCategory?.name}</p>
                          <input type="checkbox" className="whitelist-check-btn" onChange={() => handleWhiteBlackListChange(subCategory, "whiteList")} defaultChecked={subCategory?.whiteList === "YES"} disabled={updateWhiteBlackList.isPending} />
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </Form.Group>
            </div>

            <div className="col-12 col-md-12">
              <Form.Group>
                <div className="label-with-right-btn">
                  <Form.Label htmlFor="blacklistTo">Blacklist to</Form.Label>
                </div>
                <ul className="category-tag-preview-lists mt-0">
                  {
                    watchSubCategories?.map((subCategory: { id: string; name: string; blackList: string; }) => (
                      <li key={subCategory?.id} className="category-tag-preview-list-col">
                        <div className="category-tag-preview-list-box">
                          <p>{subCategory?.name}</p>
                          <input type="checkbox" className="whitelist-check-btn" onChange={() => handleWhiteBlackListChange(subCategory, "blackList")} defaultChecked={subCategory?.blackList === "YES"} disabled={updateWhiteBlackList.isPending} />
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </Form.Group>
            </div>
          </div>
        </div>

        <div className="footer-part">
          {/* <button type="button" className="custom-btn close-btn">
            Delete
          </button> */}
          <button type="button" className="custom-btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="nested-category-right-panel-overlay"></div>
    </Form>
  );
};

export default CategoryForm;
