import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import Loader from "../../../utils/Loader";
import { usePermissions, useRole, useSetRolePermissions } from "../../../apis/queries/roles.queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

type PermissionFormProps = {
    show: boolean;
    roleId: number,
    handleClose: () => void;
};

const PermissionForm: React.FC<PermissionFormProps> = ({ show, roleId, handleClose }) => {
    const queryClient = useQueryClient();
    const [isLoadingRolePermission, setisLoadingRolePermission] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [rolePermissions, setRolePermissions] = useState<number[]>([]);

    const permissionsQuery = usePermissions({
        page: 1,
        limit: 100
    });

    const roleQuery = useRole(roleId, isLoadingRolePermission);

    const updateRolePermissions = useSetRolePermissions();

    useEffect(() => {
        setPermissions(permissionsQuery?.data?.data || [])
    }, [permissionsQuery?.data?.data]);

    useEffect(() => {
        setRolePermissions(roleQuery?.data?.data?.adminRolePermission?.map((permission: any) => {
            return permission.adminPermissionId;
        }) || [])
    }, [roleQuery?.data?.data]);

    useEffect(() => {
        setisLoadingRolePermission(true);
        queryClient.invalidateQueries({ queryKey: ["role"] });
    }, []);

    const selectPermission = (event: any, permission: any) => {
        let checked = event.target.checked;
        let selectedPermissions = rolePermissions;
        if (checked) {
            selectedPermissions.push(permission.id);
        } else {
            selectedPermissions.splice(selectedPermissions.indexOf(Number(permission.id)), permission.id)
        }
        setRolePermissions([...selectedPermissions]);
    };

    const savePermissions = async () => {
        if (rolePermissions.length == 0) {
            toast.error('Please select one or more permissions');
            return;
        }
        // console.log(rolePermissions);return;

        setIsLoading(true);
        try {
            let response = await updateRolePermissions.mutateAsync({
                adminRoleId: roleId,
                permissionIdList: rolePermissions.map(permissionId => {
                    return { permissionId };
                })
            });
            if (response?.status) {
                toast.success('Permissions updated successfully');
                handleClose();
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
                    <Modal.Title as="h3">Set Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <div className="col-12 col-md-12 mb-3">
                            <Form.Group>
                                <div className="mb-2">
                                    <div className="listingMain">
                                        <div className="category-nested-accordions">
                                            {permissions.map(permission => {
                                                return (
                                                    <div key={permission.id} className="category-nested-accordion-item cursor-pointer">
                                                        <div className="category-accordion-header">
                                                            <div className="lediv">
                                                                <div className="div-li no-child">
                                                                    <div className="lediv">
                                                                        <h5>{permission.name}</h5>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="rgdiv">
                                                                <input type="checkbox" checked={rolePermissions.includes(permission.id)} onChange={(e) => selectPermission(e, permission)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Form.Group>
                        </div>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="dark" type="button" size="sm" disabled={isLoading} onClick={savePermissions}>
                        {isLoading ? (
                            <Loader
                                loaderWidth="30px"
                                loaderHeight="30px"
                                position="relative"
                            />
                        ) : 'Save'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
};

export default PermissionForm;