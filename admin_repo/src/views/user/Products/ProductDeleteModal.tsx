import { Modal, Button, Alert } from "react-bootstrap";
import { useDeleteProduct } from "../../../apis/queries/products.queries";
import { toast } from "react-toastify";

type ProductDeleteModalProps = {
  show: any;
  handleClose: any;
  variant: any;
  text: any;
  buttonText: any;
};

const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  show,
  handleClose,
  variant,
  text,
  buttonText,
}) => {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    try {
      const response = await deleteProduct.mutateAsync(show.id);
      if (response?.status) {
        toast.success("Product deleted successfully");
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Modal show={show.show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Delete Product</Modal.Title>
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

export default ProductDeleteModal;
