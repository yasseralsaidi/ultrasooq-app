import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDeletePolicy } from "../../../apis/queries/policies.queries";

type PolicyDeleteModalProps = {
    show: any;
    handleClose: any;
    variant: any;
    text: any;
    buttonText: any;
};

const PolicyDeleteModal: React.FC<PolicyDeleteModalProps> = ({
    show,
    handleClose,
    variant,
    text,
    buttonText,
}) => {
    const deletePolicy = useDeletePolicy();

    const handleDelete = async () => {
        try {
            const response = await deletePolicy.mutateAsync(show.id);
            if (response?.status) {
                toast.success("Deleted successfully");
                handleClose();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <Modal show={show.show} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>Delete Policy</Modal.Title>
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

export default PolicyDeleteModal;
