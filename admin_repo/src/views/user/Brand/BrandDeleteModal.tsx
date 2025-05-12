import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { useDeleteBrands } from "../../../apis/queries/brand.queries";
import { toast } from "react-toastify";

type BrandDeleteModalProps = {
  show: any;
  handleClose: any;
  variant: any;
  text: any;
  buttonText: any;
};

const BrandDeleteModal: React.FC<BrandDeleteModalProps> = ({
  show,
  handleClose,
  variant,
  text,
  buttonText,
}) => {
  const deleteBrand = useDeleteBrands();

  const handleDelete = async () => {
    try {
      const response = await deleteBrand.mutateAsync(show.id);
      if (response?.status) {
        toast.success("Brand deleted successfully");
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Modal show={show.show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Delete Brand</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant={variant}>{text}</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" size="sm" onClick={handleClose}>
          Close
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BrandDeleteModal;
