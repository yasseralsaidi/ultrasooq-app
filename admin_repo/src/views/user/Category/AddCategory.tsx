import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import {
  Controller,
  // Controller,
  useForm,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import {
  getCategoryAction,
  getAllMenuAction,
  getAllCategoryAction,
} from "../../../redux/actions/CategoryActions";
import Loader from "../../../utils/Loader";
import Select from "react-select";
import api from "../../../services/Axios";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadFile } from "../../../apis/queries/upload.queries";
import NoImagePlaceholder from "../../../assets/images/no-image.jpg";
// import ReactSelect from "react-select";
// import { CATEGORY_TYPE_LIST } from "../../../utils/constants";

// const customStyles = {
//   control: (base) => ({
//     ...base,
//     height: 48,
//     minHeight: 48,
//   }),
//   menu: (base) => ({
//     ...base,
//     zIndex: 20,
//   }),
// };

type AddCategoryProps = {
  show: boolean;
  handleClose: () => void;
  limit: number;
  page: number;
};

const AddCategory: React.FC<AddCategoryProps> = ({
  show,
  handleClose,
  limit,
  page,
}) => {
  const queryClient = useQueryClient();
  const [parentId, setParentId] = useState<any>([]);
  const [subCategoryArray, setSubCategoryArray] = useState<any>([]);
  const [category, setCategory] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const formSchema = yup.object().shape({
    name: yup.string().required("Provide your category name"),
    parentId: yup.string().optional(),
    menuId: yup.string().required("Select your category type"),
    iconImage: yup.string().optional(),
  });

  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "all",
    defaultValues: {
      name: "",
      parentId: "1",
      menuId: "",
      iconImage: "",
    },
  });

  const { menus } = useSelector((state: any) => state.getMenus);
  const { subCategory } = useSelector((state: any) => state.getCategory);
  const upload = useUploadFile();

  const watchIconImage = form.watch("iconImage");

  useMemo(() => dispatch(getAllMenuAction() as any), [dispatch]);
  useMemo(
    () =>
      dispatch(getCategoryAction(parentId[parentId?.length - 1]?.value) as any),
    [dispatch, parentId]
  );

  useEffect(() => {
    if (
      subCategory &&
      subCategory.children &&
      subCategory.children.length > 0
    ) {
      let categories = subCategory?.children?.map((menu: any) => ({
        value: menu?.id,
        label: menu?.name,
      }));
      setCategory((pre: any) => [...pre, categories]);
    }
  }, [subCategory]);

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

      // console.log(event.target.files, field);
      const response = await handleUploadedFile(event.target.files);
      console.log(response);
      form.setValue("iconImage", response);
      // return;
    }
  };

  const reset = () => {
    form.reset();
    setParentId([]);
    setSubCategoryArray([]);
    setCategory([]);
    handleClose();
  };

  const onSubmit = (data: any) => {
    data.type = "CATEGORY";
    data.parentId = parseInt(data.menuId);
    // data.menuId = parseInt(data.menuId);
    data.menuId = 1;
    data.icon = data.iconImage;
    delete data.iconImage;

    if (subCategoryArray.length > 0) {
      data.parentId = subCategoryArray[subCategoryArray.length - 1].value;
      data.type = String(subCategoryArray.length) + "CATEGORY";
    }

    setIsLoading(true);
    console.log(data);
    // return;

    api
      .post("/category/create", data)
      .then(({ data }) => {
        setIsLoading(false);
        if (data.status) {
          toast.success("Category created successfully");
          reset();
          dispatch(getAllCategoryAction({ limit, page }) as any);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        } else {
          toast.error(data.message);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err.response ? err.response.data.message : err.toString());
      });
  };

  const handleChange = (selectedOption: any, index: number) => {
    if (subCategoryArray[index]) {
      subCategoryArray[index] = selectedOption;
      setCategory(category.slice(0, index + 1));
      setSubCategoryArray(subCategoryArray.slice(0, index + 1));
      setParentId([...parentId.slice(1, index + 2), selectedOption]);
    } else {
      setSubCategoryArray([...subCategoryArray, selectedOption]);
      setParentId([...parentId, selectedOption]);
    }
  };

  const SubCategoryElement = ({ subCategory, index }: any) => (
    <>
      {subCategory?.length > 0 && (
        <Col md={12} className="mb-4">
          <Form.Group className="mb-0">
            <Form.Label htmlFor="menu">
              Choose {"SUB_".repeat(index)}Category
            </Form.Label>
            <Select
              value={subCategoryArray[index]}
              onChange={(newValue) => handleChange(newValue, index)}
              options={subCategory}
            />
          </Form.Group>
        </Col>
      )}
    </>
  );

  return (
    <Modal show={show} onHide={reset} keyboard={false} backdrop="static">
      <Modal.Header>
        <Modal.Title as={"h3"}>Add Category</Modal.Title>
      </Modal.Header>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <div className="flex justify-center mb-4">
              <Controller
                control={form.control}
                name="iconImage"
                render={({ field }) => (
                  <div className="relative w-48 h-48">
                    <div className="relative m-auto flex h-48 w-48 flex-wrap items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center">
                      {watchIconImage && watchIconImage !== "" ? (
                        <img
                          src={watchIconImage || NoImagePlaceholder}
                          alt="profile"
                          className="h-[198px] w-48 rounded-lg"
                        />
                      ) : (
                        <div className="absolute top-0 h-full text-sm font-medium leading-4 text-color-dark flex flex-col justify-center items-center">
                          <img
                            src="/images/upload.png"
                            className=" mb-4"
                            alt="camera"
                          />
                          <span>Drop your Image or </span>
                          <span className="text-blue-500">browse</span>
                          <p className="text-normal mt-2 text-xs leading-4 text-gray-300">
                            (.jpg or .png only. Up to 50mb)
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        multiple={false}
                        className="absolute top-0 h-[198px] w-full cursor-pointer opacity-0"
                        onChange={(event) => handleFileChanges(event)}
                        id="productImages"
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <Col md={12} className="mb-4">
              <Form.Group className="mb-0">
                <Form.Label htmlFor="name">Category Name</Form.Label>
                <Form.Control
                  type="text"
                  id="name"
                  {...form.register("name")}
                />
              </Form.Group>
              {form.formState.errors.name && (
                <p className="text-danger position-absolute">
                  {form.formState.errors.name.message}
                </p>
              )}
            </Col>
            <Col md={12} className="mb-4">
              <Form.Group className="mb-0">
                <Form.Label htmlFor="menu">Choose Menu</Form.Label>
                <select
                  id="menu"
                  className="form-control"
                  {...form.register("menuId", {
                    onChange: (e) => {
                      setCategory([]);
                      setParentId([
                        { value: e.target.value, label: e.target.value },
                      ]);
                      setSubCategoryArray([]);
                    },
                  })}
                >
                  <option value={""}>Open this select menu</option>
                  {menus &&
                    menus?.children?.map((menu: any) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                </select>
              </Form.Group>
              {form.formState.errors.menuId && (
                <p className="text-danger position-absolute">
                  {form.formState.errors.menuId.message}
                </p>
              )}
            </Col>

            {/* <Col md={12} className="mb-4">
              <Form.Group className="mb-0">
                <Form.Label htmlFor="menu">Choose Category Type</Form.Label>
                <Controller
                  name="menuId"
                  control={form.control}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      onChange={(newValue) => {
                        field.onChange(newValue?.value);
                      }}
                      options={CATEGORY_TYPE_LIST}
                      value={CATEGORY_TYPE_LIST.find(
                        (item) => item.value === field.value
                      )}
                      styles={customStyles}
                      instanceId="menuId"
                    />
                  )}
                />
              </Form.Group>
              {form.formState.errors.menuId && (
                <p className="text-danger position-absolute">
                  {form.formState.errors.menuId.message}
                </p>
              )}
            </Col> */}

            {category.length > 0 &&
              category.map((element: any, index: number) => (
                <SubCategoryElement
                  subCategory={element}
                  index={index}
                  key={index}
                />
              ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="themeBtn closeBtn"
            type="reset"
            variant="secondary"
            onClick={() => reset()}
          >
            Close
          </Button>
          <Button className="themeBtn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader
                loaderWidth={"30px"}
                loaderHeight={"30px"}
                position={"relative"}
              />
            ) : (
              "Add Category"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategory;
