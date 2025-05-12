import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import Loader from "../../../utils/Loader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useCreateBrand,
  useUpdateBrands,
} from "../../../apis/queries/brand.queries";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type AddBrandProps = {
  show: any;
  handleClose: any;
};

const AddBrand: React.FC<AddBrandProps> = ({ show, handleClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = Yup.object().shape({
    brandName: Yup.string().required("Provide your Brand name"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(formSchema), mode: "all" });
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrands();

  const resetForm = () => {
    handleClose();
    reset();
  };

  const onSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const data =
        show.item !== null ? { brandId: show.item.id, ...formData } : formData;
      const response =
        show.item !== null
          ? await updateBrand.mutateAsync(data)
          : await createBrand.mutateAsync(data);
      if (response?.status) {
        toast.success(`Brand ${show.item ? "updated" : "added"} successfully`);
        setValue("brandName", "");
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show.item !== null) {
      setValue("brandName", show.item.brandName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show?.item?.brandName]);

  return (
    <Modal
      show={show.show}
      onHide={resetForm}
      keyboard={false}
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title as="h3">{`${
          show.item !== null ? "Edit" : "Add"
        } Brand`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={12} className="mb-4">
              <Form.Group className="mb-0">
                <Form.Label htmlFor="brandName">Brand Name</Form.Label>
                <Form.Control
                  type="text"
                  id="brandName"
                  {...register("brandName")}
                />
              </Form.Group>
              {errors.brandName && (
                <p className="text-danger position-absolute">
                  {errors.brandName.message}
                </p>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={resetForm}>
            Close
          </Button>
          <Button variant="dark" type="submit" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader
                loaderWidth="30px"
                loaderHeight="30px"
                position="relative"
              />
            ) : (
              `${show.item !== null ? "Update" : "Add"} Brand`
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddBrand;
