import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { IoIosCloseCircle } from "react-icons/io";
import { useCategories, useCategoryById, useCreateMultipleCategory, useDeleteCategory, useUpdateCategory, useUpdateWhiteBlackList, } from "../../../apis/queries/category.queries";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY_TYPE } from "../../../utils/constants";
import { toast } from "react-toastify";
import { Item } from "../../../utils/types/common.types";
import { useUploadFile } from "../../../apis/queries/upload.queries";
import { MdOutlineImageNotSupported } from "react-icons/md";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
import classNames from "classnames";
import api from "../../../services/Axios";
import { useCreatePolicy, useDeletePolicy, useSinglePolicy, useUpdatePolicy } from "../../../apis/queries/policies.queries";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledRichTextEditor from "../../../components/shared/Forms/ControlledRichTextEditor";
import PolicyDeleteModal from "./PolicyDeleteModal";

type PoliciesEditFormProps = {
  isVisible: boolean;
  onClose: () => void;
  policyId?: string;
  fullCategoryList?: any;
};

const PoliciesEditForm: React.FC<PoliciesEditFormProps> = ({ isVisible = false, onClose = () => { }, policyId = "", fullCategoryList, }) => {
  const queryClient = useQueryClient();
  const formSchema = Yup.object().shape({
    policyName: Yup.string().required("Provide the Policy name"),
    policyCategory: Yup.string().required("Provide the category"),
    // ruleSubCategory: Yup.string().required("Provide the sub-category"),
    policyRule: Yup.array().optional(),
  });
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "all",
    defaultValues: {
      policyName: "",
      policyCategory: "",
      policyRule: [{ text: '' }],
    },
  });
  const onCloseHandle = () => {
    form.reset();
    onClose();
  }
  const [subCategory, setSubCategory] = useState("")
  const [deleteData, setDeleteData] = useState<any>({ id: null, show: false });
  const [text, setText] = useState("");

  const policyQueryById = useSinglePolicy({ policyId }, !!policyId);
  const createPolicy = useCreatePolicy();
  const updatePolicyQuery = useUpdatePolicy();
  const deletePolicy = useDeletePolicy();
  function isValidJson(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  const handleAddSubCategory = async () => {
    if (!subCategory) return;
    try {
      let data: any = {
        "ruleName": "",
        "rule": "",
        "categoryName": subCategory,
        'parentId': policyId
      }
      const response = await createPolicy.mutateAsync(data);
      if (response?.status) {
        toast.success(`Sub category for policy added successfully`);
        // queryClient.invalidateQueries({ queryKey: ["single-policy", policyId], });
        policyQueryById.refetch();
        setSubCategory("");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to add ,please try again!`);
    }
  };

  const handleBadgeRemove = async (id: any) => {
    try {
      const response = await deletePolicy.mutateAsync(id);
      if (response?.status) {
        toast.success("puolicy sub category deleted successfully");
        policyQueryById.refetch();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete, please try again!");
    }
  };

  const onSubmit = async (data: any, type: string) => {
    try {
      const { policyName, policyCategory, policyRule } = data;
      if (type === "mainCat") {
        // const mainIconImage = form.getValues("mainIconImage");
        let payload: any = {
          "policyId": policyId,
          "ruleName": policyName,
          "rule": JSON.stringify(policyRule),
          "categoryName": policyCategory
        }
        const response = await updatePolicyQuery.mutateAsync(payload);
        if (response?.status) {
          toast.success("Policy updated successfully");
          form.setValue("policyName", "");
          form.setValue("policyCategory", "");
          form.setValue("policyRule", [{ text: '' }]);
          queryClient.invalidateQueries({ queryKey: ["single-policy", policyId], });
          policyQueryById.refetch();
          onCloseHandle();
        }
      } else {
        let data: any = {
          "ruleName": policyName,
          "rule": JSON.stringify(policyRule),
          "categoryName": policyCategory,
          'parentId': policyId
        }
        const response = await createPolicy.mutateAsync(data);
        if (response?.status) {
          toast.success(`Sub category for policy added successfully`);
          form.setValue("policyName", "");
          form.setValue("policyCategory", "");
          form.setValue("policyRule", [{ text: '' }]);
          queryClient.invalidateQueries({ queryKey: ["single-policy", policyId], });
          policyQueryById.refetch();
        }
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error?.data?.message || "failed to update, please try again!");
    }
  };

  useEffect(() => {
    if (policyQueryById.data?.data) {

      const extractedData = policyQueryById?.data?.data;
      console.log(isValidJson(extractedData?.rule))
      form.reset({
        policyName: extractedData?.ruleName,
        policyCategory: extractedData?.categoryName,
        policyRule: isValidJson(extractedData?.rule)
          ? JSON.parse(extractedData?.rule)
          : [{ text: '' }],
      });
    }
  }, [policyQueryById?.data?.data, policyId]);
  return (
    <>
      <PolicyDeleteModal
        variant="danger"
        show={deleteData}
        handleClose={() => {
          setDeleteData({ id: null, show: false })
          onCloseHandle();
        }}
        text={text}
        buttonText="Delete"
      />
      <FormProvider {...form}>
        <Form onSubmit={(e: any) => {
          e.preventDefault();
          const type = e.nativeEvent.submitter.value;
          form.handleSubmit((data) => onSubmit(data, type))(e);
        }}>
          <div className={isVisible ? "nested-category-right-panel show" : "nested-category-right-panel"}>
            <div className="header-part">
              <h5>Policy</h5>
              <button type="button" className="close-btn" onClick={onCloseHandle}>
                <img src="/images/modaclosebtn.svg" alt="" />
              </button>
            </div>
            <div className="body-part">
              <div className="row">

                <div className="col-12 col-md-12">
                  <Form.Group>
                    <Form.Label htmlFor="name">Policy Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="policyName"
                      {...form.register("policyName")}
                      placeholder="Enter Policy Name"
                    />
                    {form.formState.errors.policyName && (
                      <p className="text-danger">{form.formState.errors.policyName.message}</p>
                    )}
                  </Form.Group>
                </div>
                <div className="col-12 col-md-12">
                  <Form.Group>
                    <Form.Label htmlFor="name">Policy Category</Form.Label>
                    <Form.Control
                      type="text"
                      id="policyCategory"
                      {...form.register("policyCategory")}
                      placeholder="Enter Policy Category"
                    />
                    {form.formState.errors.policyCategory && (
                      <p className="text-danger">{form.formState.errors.policyCategory.message}</p>
                    )}
                  </Form.Group>
                </div>
                <div className="col-12 col-md-12">
                  <Form.Group>
                    {
                      (!policyQueryById?.isPending && !createPolicy.isPending) &&
                      <ControlledRichTextEditor
                        label="Policy Rule"
                        name="policyRule"
                      />
                    }

                  </Form.Group>
                </div>
                <div className="col-12 col-md-12">
                  <div className="form-group-multi-action-btns-inline">
                    <button type="submit" className="custom-btn" disabled={updatePolicyQuery.isPending} value="mainCat">
                      {
                        updatePolicyQuery.isPending ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : null
                      }
                      <span className="mx-2">Update</span>
                    </button>
                    <button type="submit" className="custom-btn" disabled={updatePolicyQuery.isPending} value="subCat">
                      {
                        createPolicy.isPending ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : null
                      }
                      <span className="mx-2">Add as Sub category</span>
                    </button>
                  </div>
                </div>
                {/* <div className="col-12 col-md-12">
                  <div className="input-with-right-add-btn">
                    <Form.Control
                      type="text"
                      id="subCategory"
                      value={subCategory}
                      onChange={e => setSubCategory(e.target.value)}
                      placeholder="Enter Sub Category"
                    //  onKeyDown={(e: any) => handleInputKeyPress(e, "subCategories")}
                    />
                    <button type="button" className="add-btn" disabled={!subCategory.trim() || createPolicy.isPending} onClick={handleAddSubCategory}>
                      {
                        createPolicy?.isPending ? "Please wait" : "Add To Lists"
                      }
                    </button>
                  </div>
                </div> */}
                <div>
                  <label htmlFor="">Sub category policies -</label>
                  <ul className="category-tag-preview-lists">
                    {
                      policyQueryById?.data?.data?.children?.map((value: any, index: number) => (
                        <li key={value?.id} className="category-tag-preview-list-col">
                          <div className="category-tag-preview-list-box">
                            {/* {
                          subCategory?.icon ? (
                            <img src={subCategory?.icon} alt="category-icon" height={36} width={36} />
                          ) : (
                            <MdOutlineImageNotSupported size={36} />
                          )
                        } */}
                            <p>{value?.categoryName}</p>
                            <button type="button" onClick={() => handleBadgeRemove(value?.id)} disabled={deletePolicy.isPending}>
                              {
                                deletePolicy.isPending ? (
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
                </div>
              </div>
            </div>

            <div className="footer-part">
              <button type="button" className="custom-btn-skyblue"
                onClick={() => {
                  setDeleteData({ id: policyId, show: true });
                  setText(
                    `Are you sure you want to delete ?`
                  );
                }}
                title="Delete"
              >
                Delete Policy
              </button>
              <button type="button" className="custom-btn close-btn" onClick={onCloseHandle}>
                Close
              </button>
            </div>
          </div>
          <div className="nested-category-right-panel-overlay"></div>
        </Form>
      </FormProvider>
    </>
  );
};

export default PoliciesEditForm;
