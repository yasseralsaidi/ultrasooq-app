import { useUpdateUserTradeRole } from "../../../apis/queries/userlist.queries";
import Loader from "../../../utils/Loader";
import React, { useState, useEffect } from "react";
import { Button, Modal, Row } from "react-bootstrap";
import { toast } from "react-toastify";

type ChangeTradeRoleProps = {
    show: boolean;
    userId: number,
    userTradeRole: string;
    handleClose: () => void;
};

const ChangeTradeRole: React.FC<ChangeTradeRoleProps> = ({ show, userId, userTradeRole, handleClose }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<string>();
    const roles: { label: string, value: string }[] = [
        {
            label: 'Company',
            value: 'COMPANY'
        },
        {
            label: 'Freelancer',
            value: 'FREELANCER'
        },
        {
            label: 'Buyer',
            value: 'BUYER'
        }
    ];

    const updateUserTradeRole = useUpdateUserTradeRole();

    const updateRole = async () => {
        if (!selectedRole) {
            toast.error('Please select role');
            return;
        }

        setIsLoading(true);
        try {
            let response = await updateUserTradeRole.mutateAsync({
                userId: userId,
                tradeRole: selectedRole
            });

            if (response?.status) {
                toast.success(response.message);
                handleClose()
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
        <>
            <Modal
                show={show}
                onHide={() => handleClose()}
                keyboard={false}
                backdrop="static"
            >
                <Modal.Header>
                    <Modal.Title as="h3">Change Trade Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <div className="col-12 col-md-12 mb-3">
                            <div className="form-group">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select className="form-control" onChange={(e) => setSelectedRole(e.target.value)}>
                                    <option value="">Select Role</option>
                                    {roles.filter(role => role.value != userTradeRole).map(role => {
                                        return (
                                            <option value={role.value}>{role.label}</option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="dark" type="button" size="sm" disabled={isLoading} onClick={updateRole}>
                        {isLoading ? (
                            <Loader
                                loaderWidth="30px"
                                loaderHeight="30px"
                                position="relative"
                            />
                        ) : 'Update Trade Role'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ChangeTradeRole;