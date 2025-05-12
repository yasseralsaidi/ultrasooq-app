import React, { useState } from "react";
import { useOrders } from "../../../apis/queries/orders.queries";
import Loader from "../../../utils/Loader";
import { Table } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Pagination from "../../../components/shared/Pagination";
import { Link } from "react-router-dom";
import { MdRemoveRedEye } from "react-icons/md";
import { convertDateTime } from "../../../utils/helper";

const Orders = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const ordersQuery = useOrders({
        page,
        limit,
    });

    return (
        <>
            {ordersQuery.isLoading && (
                <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />
            )}
            <HelmetProvider>
                <Helmet>
                    <title>Orders</title>
                </Helmet>
            </HelmetProvider>
            <div className="listingPages allAccountsPage">
                <div className="listingPagesHead">
                    <div className="left">
                        <h3>Orders</h3>
                    </div>
                </div>
                <div className="listingMain">
                    <div className="customTable">
                        <Table>
                            <thead>
                                <tr className="whitespace-nowrap">
                                    <th>Order Number</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date & Time</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersQuery.data && ordersQuery.data.data?.length > 0 ? (
                                    ordersQuery.data?.data?.map((item: any, i: number) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.orderNo}</td>
                                                <td>{item.totalCustomerPay}</td>
                                                <td>{item.orderStatus}</td>
                                                <td>{convertDateTime(item.orderDate)}</td>
                                                <td className="td-w-120px">
                                                    <div className="td-action-icon-btns">
                                                        <Link
                                                            to={`/user/orders/${item.id}`}
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
                                        <td colSpan={5}> No order found </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {ordersQuery.data?.totalCount > 10 ? (
                        <Pagination
                            page={page}
                            setPage={setPage}
                            totalCount={ordersQuery.data?.totalCount}
                            limit={limit}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default Orders;