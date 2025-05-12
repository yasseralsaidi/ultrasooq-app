import React, { useState } from "react";
import { useMembers } from "../../../apis/queries/members.queries";
import Loader from "../../../utils/Loader";
import { Table } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Pagination from "../../../components/shared/Pagination";
import MemberForm from "../../../components/modules/members/MemberForm";

const Members = () => {
    const [action, setAction] = useState<"add" | "edit" | null>(null);
    const [showMemberForm, setShowMemberForm] = useState<boolean>(false);
    const [memberId, setMemberId] = useState<number>();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const membersQuery = useMembers({
        page,
        limit,
    });

    return (
        <>
            {membersQuery.isLoading && (
                <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
            )}
            <HelmetProvider>
                <Helmet>
                    <title>Members</title>
                </Helmet>
            </HelmetProvider>
            <div className="listingPages allAccountsPage">
                <div className="listingPagesHead">
                    <div className="left">
                        <h3>Members</h3>
                    </div>
                    <div className="right">
                        <div className="rightInner">
                        <button
                            className="themeBtn"
                            onClick={() => {
                                setShowMemberForm(true);
                                setAction("add");
                            }}
                        >
                            Add New Member
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
                                    <th>Gender</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membersQuery.data && membersQuery.data.data?.length > 0 ? (
                                    membersQuery.data?.data?.map((item: any, i: number) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>{`${item.userDetail?.firstName} ${item.userDetail?.lastName}`}</td>
                                                <td>{item.userDetail?.gender}</td>
                                                <td>{item.userDetail?.email}</td>
                                                <td>{item.userDetail?.cc}{" "}{item.userDetail?.phoneNumber}</td>
                                                <td>{item.adminRolDetail?.adminRoleName}</td>
                                                <td className="td-w-120px">
                                                    <div className="td-action-icon-btns">
                                                        <button
                                                            onClick={() => {
                                                                setShowMemberForm(true);
                                                                setAction("edit");
                                                                setMemberId(Number(item.id));
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
                                        <td colSpan={6} align="center"> No member found </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {membersQuery.data?.totalCount > 10 ? (
                        <Pagination
                            page={page}
                            setPage={setPage}
                            totalCount={membersQuery.data?.totalCount}
                            limit={limit}
                        />
                    ) : null}
                </div>
            </div>

            {action ? (<MemberForm
                show={showMemberForm}
                action={action}
                memberId={memberId}
                handleClose={() => {
                    setShowMemberForm(false);
                    setAction(null);
                    setMemberId(undefined);
                }}
            />) : null}
        </>
    );
};

export default Members;