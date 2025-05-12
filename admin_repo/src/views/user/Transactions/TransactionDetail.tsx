import { useFetchTranscationById } from "../../../apis/queries/transactions.queries";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

type RouteParams = {
    id: string;
};

const TransactionDetail = () => {
    const { id } = useParams<RouteParams>(); // Get transaction ID from URL

    // Convert id to a number safely
    const transactionId = id ? parseInt(id, 10) : 0;

    // Fetch product details using custom hook
    const transactionQueryById = useFetchTranscationById(transactionId, !!transactionId);

    if (transactionQueryById.isLoading) {
        return <p className="text-gray-500">Loading transaction details...</p>;
    }

    if (transactionQueryById.error) {
        return <p className="text-red-500">Error loading transaction details</p>;
    }

    const transaction = transactionQueryById.data?.data;

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
            {transaction ? (
                <div className="flex items-start flex-wrap">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
                    </div>
                    <div className="w-full">
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Transaction ID :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {transaction.id}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Date & Time :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {transaction.updatedAt}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Transaction Type :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {transaction.transactionType}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Transaction Status :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {transaction.transactionStatus}
                                </span>
                            </div>
                            {transaction.transactionStatus == 'SUCCESS' ? (
                                <>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Amount :
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {(transaction.amountCents / 1000).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Paymob Transaction Id :
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {transaction.paymobTransactionId}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Paymob Order Id :
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {transaction.paymobOrderId}&nbsp;
                                            (<Link
                                                to={`/user/transactions/${transaction.orderId}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Order
                                            </Link>)
                                        </span>
                                    </div>
                                </>
                            ) : null}
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Order ID :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {transaction.orderId}&nbsp;
                                    (<Link
                                        to={`/user/transactions/${transaction.orderId}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Order
                                    </Link>)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">No transaction details available.</p>
            )}
        </div>
    );
};

export default TransactionDetail;