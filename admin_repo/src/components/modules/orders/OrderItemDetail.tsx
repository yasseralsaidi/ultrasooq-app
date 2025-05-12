import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

type OrderItemDetailProps = {
    item: { [key: string]: any };
    show: boolean;
    onHide: () => void;
};

const OrderItemDetail: React.FC<OrderItemDetailProps> = ({ item, show, onHide, ...props }) => {
    return (
        <Modal
            {...props}
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            className="customModal4 w710px body-lrp-equal"
            centered
            backdrop="static"
            animation={false}
        >
            <Modal.Header>
                <h5 id="contained-modal-title-vcenter">Details</h5>
                <button
                    type="button"
                    className="customModal4-close"
                    onClick={() => {
                        onHide();
                    }}
                >
                    <img src="/images/close.svg" alt="close-icon" />
                </button>
            </Modal.Header>
            <Modal.Body>
                <div className="flex items-start flex-wrap">
                    <div className="w-full">
                        <div className="flex flex-wrap flex-col gap-2">
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Product Name :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.orderProduct_product?.productName}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Quantity :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.orderQuantity}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Price/Item :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.salePrice}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">&nbsp;</label>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">Customer</label>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Subtotal :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {Number(item.salePrice) * Number(item.orderQuantity)}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Discount :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {Number(item.salePrice) * Number(item.orderQuantity) - (item.breakdown?.customer?.purchasedPrice || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.customer?.rawCustomerFee || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Cashback :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.customer?.cashback || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Charged Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.customer?.chargedFee || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Total :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.customer?.totalPay || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">&nbsp;</label>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">Vendor</label>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Fix Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.vendor?.fixFee || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Gateway Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.vendor?.gatewayFee || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Vendor Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.vendor?.vendorFee || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Vat Amount :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.vendor?.vatAmount || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Payout :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.vendor?.payout || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">&nbsp;</label>
                            </div>
                            <div className="flex items-center justify-start">
                                <label className="text-[16px] font-medium text-[#db2302] pr-2">
                                    Platform Fee :
                                </label>
                                <span className="text-[#71717A] text-[16px] font-medium">
                                    {item.breakdown?.platform?.profit || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="modal-form-submit-actions">
                    <Button
                        variant="dark"
                        size="sm"
                        onClick={() => {
                            onHide();
                        }}
                        className="cancel-btn"
                    >
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default OrderItemDetail;