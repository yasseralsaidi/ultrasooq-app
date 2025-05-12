import React, { useState } from "react";
import { useRoles } from "../../../apis/queries/roles.queries";
import Loader from "../../../utils/Loader";
import { Button, Table } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Pagination from "../../../components/shared/Pagination";
import RoleForm from "../../../components/modules/members/RoleForm";
import PermissionForm from "../../../components/modules/members/PermissionForm";

const Roles = () => {
    const [action, setAction] = useState<"add" | "edit" | null>(null);
    const [showRoleForm, setShowRoleForm] = useState<boolean>(false);
    const [roleId, setRoleId] = useState<number>();
    const [showPermissionForm, setShowPermissionForm] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const rolesQuery = useRoles({
        page,
        limit,
    });

    const setPermission = (roleId: number) => {
        setRoleId(roleId);
        setShowPermissionForm(true);
    };

    return (
        <>
            {rolesQuery.isLoading && (
                <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
            )}
            <HelmetProvider>
                <Helmet>
                    <title>Roles</title>
                </Helmet>
            </HelmetProvider>
            <div className="listingPages allAccountsPage">
                <div className="listingPagesHead">
                    <div className="left">
                        <h3>Roles</h3>
                    </div>
                    <div className="right">
                        <div className="rightInner">
                            <button
                                className="themeBtn"
                                onClick={() => {
                                    setShowRoleForm(true);
                                    setAction("add");
                                }}
                            >
                                Add New Role
                            </button>
                        </div>
                    </div>
                </div>
                <div className="listingMain">
                    <div className="customTable">
                        <Table>
                            <thead>
                                <tr className="whitespace-nowrap">
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rolesQuery.data && rolesQuery.data.data?.length > 0 ? (
                                    rolesQuery.data?.data?.map((item: any, i: number) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.adminRoleName}</td>
                                                <td>
                                                    <div className="td-status">
                                                        <div className={`td-status-value ${item?.status == 'ACTIVE' ? "success" : "error"}`}>
                                                            {item?.status}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="td-action-icon-btns">
                                                        <Button variant="primary" size="sm" onClick={() => setPermission(item.id)}>
                                                            Permissions
                                                        </Button>
                                                        <button
                                                            onClick={() => {
                                                                setShowRoleForm(true);
                                                                setAction("edit");
                                                                setRoleId(Number(item.id));
                                                            }}
                                                            className="circle-btn"
                                                            title="Edit"
                                                        >
                                                            <img src="/images/edit.svg" alt="" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3}> No role found </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {rolesQuery.data?.totalCount > 10 ? (
                        <Pagination
                            page={page}
                            setPage={setPage}
                            totalCount={rolesQuery.data?.totalCount}
                            limit={limit}
                        />
                    ) : null}
                </div>
            </div>

            {action && showRoleForm ? (<RoleForm
                show={showRoleForm}
                action={action}
                roleId={roleId}
                handleClose={(id) => {
                    setShowRoleForm(false);
                    setAction(null);
                    if (id) {
                        setRoleId(Number(id));
                        setShowPermissionForm(true);
                    }
                }}
            />) : null}

            {roleId && showPermissionForm ? (<PermissionForm
                show={showPermissionForm}
                roleId={roleId}
                handleClose={() => {
                    setRoleId(undefined);
                    setShowPermissionForm(false);
                }}
            />) : null}
        </>
    );
};

export default Roles;