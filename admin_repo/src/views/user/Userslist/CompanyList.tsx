import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Button, Table } from "react-bootstrap";
import { Userlist } from "../../../apis/queries/userlist.queries";
import Loader from "../../../utils/Loader";
import Pagination from "../../../components/shared/Pagination";
import { GENDER_LIST } from "../../../utils/constants";
import ChangeTradeRole from "../../../components/modules/users/ChangeTradeRole";

const CompanyList = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>();
  const [isTradeRoleModalOpen, setIsTradeRoleModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const userQuery = Userlist({
    page,
    limit,
    tradeRole: "COMPANY",
  });

  // Helper function to format date
  const convertDate = (dateString: string) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    return formattedDate;
  };

  return (
    <>
      {userQuery.isLoading && (
        <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
      )}
      <HelmetProvider>
        <Helmet>
          <title>Company List</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Company List</h3>
          </div>
        </div>
        <div className="listingMain">
          <div className="customTable">
            <Table>
              <thead>
                <tr className="whitespace-nowrap">
                  <th>Sl.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {userQuery.data && userQuery.data.data?.length > 0 ? (
                  userQuery.data?.data?.map((item: any, i: number) => {
                    // Calculate serial number based on current page and index
                    const serialNumber = (page - 1) * limit + i + 1;
                    return (
                      <tr key={item.id}>
                        <td>{serialNumber}</td>
                        <td>{`${item?.firstName} ${item?.lastName}`}</td>
                        <td>{item?.email}</td>
                        <td>{item?.gender ? GENDER_LIST[item.gender] : "-"}</td>
                        <td>{convertDate(item?.dateOfBirth)}</td>
                        <td>{item?.phoneNumber || "-"}</td>
                        <td>
                          <div className="td-status">
                            <div
                              className={
                                item?.status === "INACTIVE"
                                  ? "td-status-value error"
                                  : "td-status-value success"
                              }
                            >
                              {item?.status}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="td-action-icon-btns">
                            <Button variant="primary" size="sm" onClick={() => {
                              setIsTradeRoleModalOpen(true);
                              setSelectedUserId(item.id);
                            }}>
                                Change Trade Role
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}> No company list found </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {userQuery.data?.totalCount > 5 ? (
            <Pagination
              page={page}
              setPage={setPage}
              totalCount={userQuery.data?.totalCount}
              limit={limit}
            />
          ) : null}
        </div>
      </div>
      {selectedUserId && <ChangeTradeRole
        show={isTradeRoleModalOpen}
        userId={selectedUserId}
        userTradeRole="COMPANY"
        handleClose={() => {
          setIsTradeRoleModalOpen(false);
          setSelectedUserId(undefined);
        }}
      />}
    </>
  );
};

export default CompanyList;
