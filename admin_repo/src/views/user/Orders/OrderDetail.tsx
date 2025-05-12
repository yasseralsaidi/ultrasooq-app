import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFetchOrderById } from "../../../apis/queries/orders.queries";
import { convertDateTime } from "../../../utils/helper";
import { MdRemoveRedEye } from "react-icons/md";
import OrderItemDetail from "../../../components/modules/orders/OrderItemDetail";

type RouteParams = {
    id: string;
};

const OrderDetail = () => {
    const [item, setItem] = useState<any>();
    const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState<boolean>(false);
    const { id } = useParams<RouteParams>(); // Get order ID from URL

    // Convert id to a number safely
    const orderId = id ? parseInt(id, 10) : 0;

    // Fetch product details using custom hook
    const orderQueryById = useFetchOrderById(orderId, !!orderId);

    if (orderQueryById.isLoading) {
        return <p className="text-gray-500">Loading order details...</p>;
    }

    if (orderQueryById.error) {
        return <p className="text-red-500">Error loading order details</p>;
    }

    const order = orderQueryById.data?.data;

    const formatAddress = (address: any) => {
        return [
            address.address,
            address.town,
            address.city,
            address.province,
            address.postCode,
            address.country
        ].filter(el => el).join(', ');
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
            {order ? (
                <div className="flex items-start flex-wrap">
                    <div className="w-full">
                        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
                    </div>
                    <div className="w-[50%]">
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Order ID :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {orderId}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Order Number :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.orderNo}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Order Status :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Date & Time :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {convertDateTime(order.orderDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Subtotal :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.totalPrice}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Discount :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.totalDiscount}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Customer Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {Number(order.totalCustomerPay) - (Number(order.totalPrice) - Number(order.totalDiscount))}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Total :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.totalCustomerPay}
                                </span>
                            </div>
                        </div>
                        {order.paymentType == 'DIRECT' && !order.dueAmount ? (
                            <div className="flex flex-wrap flex-col gap-2">
                                <div className="flex items-center justify-start">
                                    <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                        Paid :
                                    </label>
                                    <span className="text-[#71717A] text-[16px] font-medium">
                                        {order.totalCustomerPay}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap flex-col gap-2">
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Advance :
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {order.advanceAmount}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap flex-col gap-2">
                                    <div className="flex items-center justify-start">
                                        <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                            Due :
                                        </label>
                                        <span className="text-[#71717A] text-[16px] font-medium">
                                            {order.dueAmount}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Platform Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {order.totalPlatformFee}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-[50%]">
                        <div className="flex flex-wrap flex-col gap-2">
                            {(() => {
                                const address = order.order_orderAddress?.find((item: any) => item.addressType == 'BILLING');

                                if (!address) return null;

                                return (
                                    <>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Billing Address
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Name :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {`${address.firstName} ${address.lastName}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Email :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {address.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Phone :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {address.phone}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Address :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {formatAddress(address)}
                                            </span>
                                        </div>
                                    </>
                                )
                            })()}
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">&nbsp;</label>
                            </div>
                            {(() => {
                                const address = order.order_orderAddress?.find((item: any) => item.addressType == 'SHIPPING');

                                if (!address) return null;

                                return (
                                    <>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Shipping Address
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Name :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {`${address.firstName} ${address.lastName}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Email :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {address.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Phone :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {address.phone}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                                Address :
                                            </label>
                                            <span className="text-[#71717A] text-[16px] font-medium">
                                                {formatAddress(address)}
                                            </span>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                    <div className="w-full mt-5 product_details_table">
                        <div className="w-full mb-4 product_details_table_heading">
                            <h2 className="text-2xl font-bold text-black">Items</h2>
                        </div>
                        <table className="table" border={1} cellPadding={0} cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price / Item</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.order_orderProducts.map((item: any) => (
                                    <tr key={item.id}>
                                        <td align="left" valign="top">
                                            {item.orderProduct_product?.productName}
                                        </td>
                                        <td align="left" valign="top">
                                            {item.orderQuantity}
                                        </td>
                                        <td align="left" valign="top">
                                            {item.salePrice}
                                        </td>
                                        <td align="left" valign="top">
                                            <div className="td-action-icon-btns">
                                                <button
                                                    type="button"
                                                    className="circle-btn"
                                                    onClick={() => {
                                                        setItem(item);
                                                        setIsItemDetailModalOpen(true);
                                                    }}
                                                >
                                                    <MdRemoveRedEye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">No order details available.</p>
            )}

            {item && <OrderItemDetail
                item={item}
                show={isItemDetailModalOpen}
                onHide={() => {
                    setItem(undefined);
                    setIsItemDetailModalOpen(false);
                }}
            />}
        </div >
    );
};

export default OrderDetail;