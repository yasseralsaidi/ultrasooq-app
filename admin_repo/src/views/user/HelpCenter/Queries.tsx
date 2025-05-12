import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Table } from "react-bootstrap";
import { HelpCenterQueries } from "../../../apis/queries/help-center.queries";
import Loader from "../../../utils/Loader";
import Pagination from "../../../components/shared/Pagination";
import AnswerForm from "../../../components/modules/help-center/AnswerForm";
import { MdRemoveRedEye } from "react-icons/md";

const Queries = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const helpCenterQueries = HelpCenterQueries({
    page,
    limit,
  });

  const [answerModalShow, setAnswerModalShow] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<any | undefined>();

  // Helper function to format date
  const convertDateTime = (dateString: string) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      minute: "numeric",
      hour: "numeric",
      hour12: true,
      second: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    return formattedDate;
  };

  return (
    <>
      {helpCenterQueries.isLoading && (
        <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
      )}
      <HelmetProvider>
        <Helmet>
          <title>Help Center</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Queries</h3>
          </div>
        </div>
        <div className="listingMain">
          <div className="customTable">
            <Table>
              <thead>
                <tr className="whitespace-nowrap">
                  <th>Email</th>
                  <th>Query</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {helpCenterQueries.data && helpCenterQueries.data.data?.length > 0 ? (
                  helpCenterQueries.data?.data?.map((item: any, i: number) => {
                    return (
                      <tr key={item.id}>
                        <td>{item.userEmail}</td>
                        <td>{item.query.length > 30 ? item.query.substr(0, 30) + '...' : item.query}</td>
                        <td>{convertDateTime(item.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="circle-btn"
                            onClick={() => {
                              setSelectedQuery(item);
                              setAnswerModalShow(true);
                            }}
                          >
                            <MdRemoveRedEye size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4}> No query found </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {helpCenterQueries.data?.totalCount > 10 ? (
            <Pagination
              page={page}
              setPage={setPage}
              totalCount={helpCenterQueries.data?.totalCount}
              limit={limit}
            />
          ) : null}
        </div>

        {selectedQuery && <AnswerForm
          show={answerModalShow}
          onHide={() => {
            setSelectedQuery(undefined);
            setAnswerModalShow(false);
          }}
          query={selectedQuery}
        />}
      </div>
    </>
  );
};

export default Queries;