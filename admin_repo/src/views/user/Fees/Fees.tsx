import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Loader from "../../../utils/Loader";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import { useGetAllFees } from "../../../apis/queries/fees.queries";
import FeesDeleteModal from "./FeesDeleteModal";
import classNames from "classnames";
import Accordion from 'react-bootstrap/Accordion';

export default function Fees() {

    const [deleteData, setDeleteData] = useState({ id: null, show: false });

    const [text, setText] = useState("");
    const [page] = useState(1);
    const [limit] = useState(10);
    const [searchInput, setSearchInput] = useState("");

    const [activeAccordion, setActiveAccordion] = useState<string | null>("0")

    const feesQuery = useGetAllFees({ page, limit, searchTerm: searchInput, });

    const handleSearchInput = debounce((e) => setSearchInput(e.target.value), 1000);

    return (
        <>
            {feesQuery.isLoading && <Loader loaderWidth="30px" loaderHeight="30px" position="absolute" />}
            <FeesDeleteModal variant="danger" show={deleteData} handleClose={() => setDeleteData({ id: null, show: false })} text={text} buttonText="Delete" />
            <HelmetProvider>
                <Helmet>
                    <title>Fees</title>
                </Helmet>
            </HelmetProvider>
            <div className="listingPages allAccountsPage">
                <div className="listingPagesHead space-x-5">
                    <div className="left">
                        <h3>Fees</h3>
                    </div>
                    <div className="right">
                        <div className="rightInner">
                            <Link className="themeBtn" to="/user/fees/add">
                                Add New Fees
                            </Link>
                        </div>
                    </div>
                    <input placeholder="Search..." className="px-2 py-1" onChange={handleSearchInput} />
                </div>

                <div className="listingMain">
                    <Accordion defaultActiveKey="0" className="category-nested-accordions" onSelect={(event: string | null) => setActiveAccordion(event)}>
                        {
                            feesQuery?.data?.data?.map((element: any, index: number) => (
                                <div className="category-nested-accordion-item cursor-pointer" key={element?.id}>
                                    <div className="category-accordion-header">
                                        <div className="lediv">
                                            <div className="div-li">
                                                <div className="lediv">
                                                    <Accordion.Toggle eventKey={String(index)} className={classNames("func-btn", (activeAccordion === String(index)) ? 'active' : '')}></Accordion.Toggle>
                                                    <h5>{element?.feeName} {element?.fees_policy ? `(${element?.fees_policy?.categoryName})` : ''}</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rgdiv">
                                            <button type="button" className="actionbtn mr-2" onClick={(e) => {
                                                setDeleteData({ id: element.id, show: true });
                                                setText(`Are you sure you want to delete ?`);
                                            }}>
                                                <i className="fa fa-trash" aria-hidden="true"></i>
                                            </button>
                                            <Link to={`/user/fees/update/${element?.id}`}>
                                                <i className="fa fa-edit" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>

                                    <Accordion.Collapse eventKey={String(index)} className="m-8">
                                        <div className="div-ul">
                                            {
                                                element?.feesToFeesDetail?.map((locationDetails: any, feeIndex: number) => (
                                                    <div className="mb-6" key={locationDetails?.id}>
                                                        <label className="text-2xl font-bold mb-3">Location Details {feeIndex + 1}</label>
                                                        <div className="grid grid-cols-2 grid-flow-row gap-4">
                                                            <div className="max-w-lg rounded overflow-hidden shadow-lg bg-muted px-6">
                                                                <div className="py-4">
                                                                    <div className="font-bold text-xl mb-2">Vendor Location Details</div>
                                                                    <div className="row">
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Percentage</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.vendorDetail?.vendorPercentage} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Max Cap Per Deal</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.vendorDetail?.vendorMaxCapPerDeal} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">VAT</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.vendorDetail?.vendorVat} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Payment Gate Fee</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.vendorDetail?.vendorPaymentGateFee} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Fix Fee</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.vendorDetail?.vendorFixFee} disabled />
                                                                        </div>
                                                                        <div className="col-md-12 text-center">
                                                                            <label className="form-label mb-0">Max cap per month {locationDetails?.vendorDetail?.vendorMaxCapPerMonth ? 'applicable' : 'not applicable'}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {
                                                                    locationDetails?.vendorDetail?.isVendorGlobal ? (
                                                                        <div className="pb-2 text-center">
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">This fees structure is use for globally</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="pb-2 text-center">
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.vendorDetail?.vendorLocation?.feesLocation_country?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.vendorDetail?.vendorLocation?.feesLocation_state?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.vendorDetail?.vendorLocation?.feesLocation_city?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.vendorDetail?.vendorLocation?.town}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                            <div className="max-w-lg rounded overflow-hidden shadow-lg bg-muted px-6">
                                                                <div className="py-4">
                                                                    <div className="font-bold text-xl mb-2">Customer Location Details</div>
                                                                    <div className="row">
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Percentage</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.consumerDetail?.consumerPercentage} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Max Cap Per Deal</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.consumerDetail?.consumerMaxCapPerDeal} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">VAT</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.consumerDetail?.consumerVat} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Payment Gate Fee</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.consumerDetail?.consumerPaymentGateFee} disabled />
                                                                        </div>
                                                                        <div className="col-md-6 mb-3">
                                                                            <label className="form-label">Fix Fee</label>
                                                                            <input type="number" className="form-control" value={locationDetails?.consumerDetail?.consumerFixFee} disabled />
                                                                        </div>
                                                                        <div className="col-md-12 text-center">
                                                                            <label className="form-label mb-0">Max cap per month {locationDetails?.consumerDetail?.consumerMaxCapPerMonth ? 'applicable' : 'not applicable'}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {
                                                                    locationDetails?.consumerDetail?.isConsumerGlobal ? (
                                                                        <div className="pb-2 text-center">
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">This fees structure is use for globally</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="pb-2 text-center">
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.consumerDetail?.consumerLocation?.feesLocation_country?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.consumerDetail?.consumerLocation?.feesLocation_state?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.consumerDetail?.consumerLocation?.feesLocation_city?.name}</span>
                                                                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{locationDetails?.consumerDetail?.consumerLocation?.town}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </Accordion.Collapse>
                                </div >
                            ))
                        }
                    </Accordion >
                </div >
            </div >
        </>
    );
}
