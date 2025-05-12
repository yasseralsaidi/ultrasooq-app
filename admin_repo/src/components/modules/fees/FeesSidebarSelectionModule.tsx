import { Loader } from "lucide-react";
import { usePolicies } from "../../../apis/queries/policies.queries";
import React, { useState } from "react";
import classNames from "classnames";
import { UseFormSetValue } from "react-hook-form";


interface LOCATION_SCHEMA {
    vendorLocationId?: string;
    consumerFeesDetailId?: string;
    countryId?: {
        label?: string;
        value?: string;
    };
    stateId?: {
        label?: string;
        value?: string;
    };
    cityId?: {
        label?: string;
        value?: string;
    };
    town?: string;
}

interface FEE_DETAILS {
    vendorDetails?: {
        vendorPercentage?: string;
        vendorMaxCapPerDeal?: string;
        vendorVat?: string;
        vendorPaymentGateFee?: string;
        vendorFixFee?: string;
        vendorMaxCapPerMonth?: boolean;
        isGlobal?: boolean;
        location?: LOCATION_SCHEMA;
    };
    customerDetails?: {
        consumerPercentage?: string;
        consumerMaxCapPerDeal?: string;
        consumerVat?: string;
        consumerPaymentGateFee?: string;
        consumerFixFee?: string;
        consumerMaxCapPerMonth?: boolean;
        isGlobal?: boolean;
        location?: LOCATION_SCHEMA;
    }
}

interface FORM_SCHEMA {
    feeName?: string;
    feeDescription?: string;
    policyId?: string;
    feeDetails?: FEE_DETAILS[]
}

type FeesSideModalProps = {
    isVisible: boolean;
    onClose: () => void;
    setFormData: UseFormSetValue<FORM_SCHEMA>;
};

export const FeesSidebarSelectionModule: React.FunctionComponent<FeesSideModalProps> = ({ isVisible, onClose, setFormData }) => {
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

    const page: number = 1, limit: number = 1000;
    const policiesQuery = usePolicies({ page, limit, searchTerm: "", });

    const handleClose = () => {
        setSelectedPolicy(null)
        onClose();
    }

    const onChangeHandlePolicies = (event: any, item: any) => {
        const { checked } = event.target;
        if (checked) {
            setSelectedPolicy(item);
        } else {
            setSelectedPolicy(null)
        }
    }

    const onsubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
        setFormData('policyId', selectedPolicy.id)
        setSelectedPolicy(null);
        handleClose()
    };

    const [activeAccordionIds, setActiveAccordionIds] = useState<any>([]);

    const handleAccordion = (item: any) => {
        if (!item.children?.length) return;
        if (activeAccordionIds.includes(item.id)) {
            setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
        } else {
            setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
        }
    }


    const recursiveRenderList = (list: any, prevIndex: number, parentData = null) => {
        return list.map((item: any) => (
            <div key={item.id} className="category-nested-accordion-item cursor-pointer">
                <div className={classNames("category-accordion-header", activeAccordionIds.includes(item.id) ? " active" : "")} >
                    <div className="lediv">
                        <div className={classNames("div-li", !item.children?.length ? " no-child" : "")}>
                            <div className="lediv" onClick={() => {
                                if (!item.children?.length) return;
                                if (activeAccordionIds.includes(item.id)) {
                                    setActiveAccordionIds(activeAccordionIds.filter((id: number) => id !== item.id));
                                    return;
                                }
                                setActiveAccordionIds((prevState: any) => [...prevState, item.id,]);
                            }}>
                                {!item.children?.length ? null : (<button className="func-btn" onClick={() => handleAccordion(item)}></button>)}
                                <h5>{item?.categoryName}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="rgdiv">
                        <input type="checkbox" name="policies" value={item.id} onChange={(event) => onChangeHandlePolicies(event, item)} checked={item.id === selectedPolicy?.id} />
                    </div>
                </div>
                <div className="category-accordion-content">
                    <div className="div-ul">
                        {item.children?.length ? recursiveRenderList(item.children, prevIndex + 1, item) : null}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className={isVisible ? "nested-category-right-panel show" : "nested-category-right-panel"}>
            <div className="header-part">
                <h5>Policy</h5>
                <button type="button" className="close-btn">
                    <img src="/images/modaclosebtn.svg" alt="" onClick={handleClose} />
                </button>
            </div>
            <div className="body-part">
                <div className="row">
                    {
                        policiesQuery?.isPending ? <Loader /> : (
                            <div className="col-12">
                                {
                                    policiesQuery.data && policiesQuery.data.data?.length > 0 && (
                                        <div className="card shadow-sm">
                                            <div className="card-header ">
                                                <h5 className="mb-0">Select a Policy</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-2">
                                                    <div className="listingMain">
                                                        <div className="category-nested-accordions">
                                                            {policiesQuery.data.data && policiesQuery.data.data?.length ? recursiveRenderList(policiesQuery.data.data, 0) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="footer-part">
                <button className="custom-btn close-btn" onClick={onsubmit} disabled={!selectedPolicy}>
                    Save & Close
                </button>
            </div>
        </div>
    )
}