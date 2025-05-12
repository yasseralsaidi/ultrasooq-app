import React, { useState } from "react";
import { useTransactions } from "../../../apis/queries/transactions.queries";
import Loader from "../../../utils/Loader";
import { Table } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Pagination from "../../../components/shared/Pagination";
import { Link } from "react-router-dom";
import { MdRemoveRedEye } from "react-icons/md";
import { convertDateTime } from "../../../utils/helper";

const Transactions = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const transactionsQuery = useTransactions({
        page,
        limit,
    });

    return (
        <>
            {transactionsQuery.isLoading && (
                <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
            )}
            <HelmetProvider>
                <Helmet>
                    <title>Transactions</title>
                </Helmet>
            </HelmetProvider>
            <div className="listingPages allAccountsPage">
                <div className="listingPagesHead">
                    <div className="left">
                        <h3>Transactions</h3>
                    </div>
                </div>
                <div className="listingMain">
                    <div className="customTable">
                        <Table>
                            <thead>
                                <tr className="whitespace-nowrap">
                                    <th>Transaction ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date & Time</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsQuery.data && transactionsQuery.data.data?.length > 0 ? (
                                    transactionsQuery.data?.data?.map((item: any, i: number) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{(item.amountCents / 1000).toFixed(2)}</td>
                                                <td>{item.transactionStatus}</td>
                                                <td>{convertDateTime(item.updatedAt)}</td>
                                                <td className="td-w-120px">
                                                    <div className="td-action-icon-btns">
                                                        <Link
                                                            to={`/user/transactions/${item.id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            <button
                                                                type="button"
                                                                className="circle-btn"
                                                            >
                                                                <MdRemoveRedEye size={20} />
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5}>No transaction found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {transactionsQuery.data?.totalCount > 10 ? (
                        <Pagination
                            page={page}
                            setPage={setPage}
                            totalCount={transactionsQuery.data?.totalCount}
                            limit={limit}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default Transactions;