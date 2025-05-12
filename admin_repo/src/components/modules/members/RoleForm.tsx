import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import Loader from "../../../utils/Loader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useCreateRole,
  useRole,
  useUpdateRole,
} from "../../../apis/queries/roles.queries";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

type RoleFormProps = {
  show: boolean;
  action: "add" | "edit",
  roleId?: number,
  handleClose: (roleId?: number) => void;
};

const RoleForm: React.FC<RoleFormProps> = ({ show, action, roleId, handleClose }) => {
  const queryClient = useQueryClient();
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = Yup.object().shape({
    adminRoleName: Yup.string().required("Provide your role name"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(formSchema), mode: "all" });

  const roleQuery = useRole(roleId || 0, isLoadingRole)
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  useEffect(() => {
    if (roleQuery?.data?.data?.id) {
      setValue("adminRoleName", roleQuery?.data?.data?.adminRoleName);
    }
  }, [roleQuery?.data?.data]);

  useEffect(() => {
    if (roleId) {
      setIsLoadingRole(true);
      queryClient.invalidateQueries({ queryKey: ["role"] });
    }
  }, []);

  const resetForm = () => {
    reset();
    handleClose();
  };

  const onSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      let response;
      if (action == "add") {
        response = await createRole.mutateAsync(formData);
      } else {
        formData.adminRoleId = roleId;
        response = await updateRole.mutateAsync(formData);
      }
      if (response?.status) {
        toast.success(`Role ${action == "edit" ? "updated" : "added"} successfully`);
        setValue("adminRoleName", "");
        handleClose(action == "add" ? response?.data.id : roleId);
        reset();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={resetForm}
      keyboard={false}
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title as="h3">{`${action == "edit" ? "Edit" : "Add"} Role`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={12} className="mb-4">
              <Form.Group className="mb-0">
                <Form.Label htmlFor="adminRoleName">Role Name</Form.Label>
                <Form.Control
                  type="text"
                  id="adminRoleName"
                  {...register("adminRoleName")}
                />
              </Form.Group>
              {errors.adminRoleName && (
                <p className="text-danger position-absolute">
                  {errors.adminRoleName.message}
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
              `${action == "edit" ? "Update" : "Add"} Role`
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RoleForm;