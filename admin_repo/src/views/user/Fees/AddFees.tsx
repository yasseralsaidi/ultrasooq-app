import { FeesSidebarSelectionModule } from "../../../components/modules/fees/FeesSidebarSelectionModule";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAddFees, useUpdateFees } from "../../../apis/queries/fees.queries";
import { useFieldArray, useForm } from "react-hook-form";
import * as YUP from 'yup'
import { yupResolver } from "@hookform/resolvers/yup";
import { TrashIcon } from "lucide-react";
import ChooseLocation from "./ChooseLocation";
import { usePolicies } from "../../../apis/queries/policies.queries";
import { toast } from "react-toastify";
import { useCategoryById } from "../../../apis/queries/category.queries";
import { MENU_ID, RFQ_MENU_ID } from "../../../utils/constants";

interface LOCATION_SCHEMA {
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
    feeType?: boolean;
    policyId?: string;
    menuId?: number;
    feeDetails?: FEE_DETAILS[]
}

interface NODE {
    id: number;
    ruleName: string | null;
    rule: string | null;
    categoryName: string;
    parentId: number | null;
    status: string;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    children?: NODE[];
}

function flattenStructure(data: NODE[]): NODE[] {
    const result: NODE[] = [];
    function traverse(node: NODE): void {
        result.push({ ...node });
        if (node.children && node.children.length) {
            node.children.forEach(child => traverse(child));
        }
        // delete node.children;
    }
    data.forEach(item => traverse(item));
    return result;
}

export default function AddFees() {

    const addFeesQuery = useAddFees();
    const updateFeesQuery = useUpdateFees();

    const policiesQuery = usePolicies({ page: 1, limit: 1000, searchTerm: "", });
    const categoryQuery = useCategoryById(MENU_ID.toString(), true);

    const [policies, setPolicies] = useState<NODE[]>([])

    useEffect(() => {
        if (policiesQuery.data && policiesQuery.data.data) {
            setPolicies(flattenStructure(policiesQuery.data.data))
        }
    }, [policiesQuery.data])

    const router = useHistory();

    const formSchema: YUP.ObjectSchema<FORM_SCHEMA> = YUP.object().shape({
        feeName: YUP.string().required('Provide fee name for create'),
        feeDescription: YUP.string().required('Provide fee description for create'),
        feeType: YUP.boolean(),
        policyId: YUP.string().required('Provide policy id for create'),
        menuId: YUP.number().required('Select category'),
        feeDetails: YUP.array().of(
            YUP.object().shape({
                vendorDetails: YUP.object().shape({
                    vendorPercentage: YUP.string().typeError('Provide vendor percentage for create fees').required('Provide vendor percentage for create fees'),
                    vendorMaxCapPerDeal: YUP.string().typeError('Provide vendor max cap per deal for create fees').required('Provide vendor max cap per deal for create fees'),
                    vendorVat: YUP.string().typeError('Provide vendor vat for create fees').required('Provide vendor vat for create fees'),
                    vendorPaymentGateFee: YUP.string().typeError('Provide vendor payment gate fee create fees').required('Provide vendor payment gate fee for create fees'),
                    vendorFixFee: YUP.string().typeError('Provide vendor fix fee for create fees').required('Provide vendor fix fee for create fees'),
                    vendorMaxCapPerMonth: YUP.boolean().typeError('Provide vendor max cap per month for create fees').required('Provide vendor max cap per month for create fees'),
                    isGlobal: YUP.boolean().default(false),
                    location: YUP.object().shape({
                        countryId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose country for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        stateId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose state for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        cityId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose city for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        town: YUP.string().when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Provide town name for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    }).when("isGlobal", {
                        is: true,
                        then: (schema) => schema.required('Select location for create fees'),
                        otherwise: (schema) => schema.notRequired(),
                    })
                }),
                customerDetails: YUP.object().shape({
                    consumerPercentage: YUP.string().typeError('Provide consumer percentage for create fees').required('Provide consumer percentage for create fees'),
                    consumerMaxCapPerDeal: YUP.string().typeError('Provide consumer max cap per deal for create fees').required('Provide consumer max cap per deal for create fees'),
                    consumerVat: YUP.string().typeError('Provide consumer vat for create fees').required('Provide consumer vat for create fees'),
                    consumerPaymentGateFee: YUP.string().typeError('Provide consumer payment gate fee create fees').required('Provide consumer payment gate fee for create fees'),
                    consumerFixFee: YUP.string().typeError('Provide consumer fix fee for create fees').required('Provide consumer fix fee for create fees'),
                    consumerMaxCapPerMonth: YUP.boolean().typeError('Provide consumer max cap per month for create fees').required('Provide consumer max cap per month for create fees'),
                    isGlobal: YUP.boolean().default(false),
                    location: YUP.object().shape({
                        countryId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose country for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        stateId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose state for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        cityId: YUP.object().shape({
                            label: YUP.string(),
                            value: YUP.string()
                        }).when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Choose city for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                        town: YUP.string().when("isGlobal", {
                            is: true,
                            then: (schema) => schema.required('Provide town name for create fees'),
                            otherwise: (schema) => schema.notRequired(),
                        }),
                    }).when("isGlobal", {
                        is: true,
                        then: (schema) => schema.required('Select location for create fees'),
                        otherwise: (schema) => schema.notRequired(),
                    })
                })
            })
        ).min(1, 'Provide at list one fee details').required('Provide at list one fee details')
    })

    const { register, handleSubmit, formState: { errors }, watch, control, setValue, getValues } = useForm<FORM_SCHEMA>({
        mode: 'all', resolver: yupResolver(formSchema), defaultValues: {
            feeDetails: [
                {
                    vendorDetails: {
                        vendorPercentage: "",
                        vendorMaxCapPerDeal: "",
                        vendorVat: "",
                        vendorPaymentGateFee: "",
                        vendorFixFee: "",
                        vendorMaxCapPerMonth: false,
                        isGlobal: false,
                        location: {
                            countryId: {},
                            stateId: {},
                            cityId: {},
                            town: "",
                        }
                    },
                    customerDetails: {
                        consumerPercentage: "",
                        consumerMaxCapPerDeal: "",
                        consumerVat: "",
                        consumerPaymentGateFee: "",
                        consumerFixFee: "",
                        consumerMaxCapPerMonth: false,
                        isGlobal: false,
                        location: {
                            countryId: {},
                            stateId: {},
                            cityId: {},
                            town: "",
                        }
                    }
                }
            ]
        }
    })

    const { fields, append, remove, update } = useFieldArray({ control, name: 'feeDetails' })

    useEffect(() => {
        if (getValues('feeType')) {
            const fees = getValues('feeDetails');
            fees?.forEach((fee, index) => {
                if (index > 0) remove(index);
            });
        }
    }, [watch('feeType')]);

    const [addLocation, setAddLocation] = useState<{ show: boolean; locationIndex: number | null; locationFor: 'customer' | 'vendor' | null; locationDetails: FEE_DETAILS | null }>({ show: false, locationIndex: null, locationFor: null, locationDetails: null })
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const formSubmit = async (data: FORM_SCHEMA) => {
        setLoadingSubmit(true)
        try {
            setLoadingSubmit(true);
            if (data.feeType) {
                data.feeDetails = data.feeDetails?.filter((element, index) => !data.feeType || (data.feeType && index == 0))
            }
            let payload: any = {
                feeName: data.feeName,
                feeDescription: data.feeDescription,
                feeType: data.feeType ? 'GLOBAL' : 'NONGLOBAL',
                policy: Number(data.policyId),
                menuId: Number(data.menuId),
                feesDetails: data.feeDetails?.map((element) => ({
                    vendorDetails: {
                        ...element.vendorDetails,
                        location: {
                            countryId: Number(element.vendorDetails?.location?.countryId?.value),
                            stateId: Number(element.vendorDetails?.location?.stateId?.value),
                            cityId: Number(element.vendorDetails?.location?.cityId?.value),
                            town: element.vendorDetails?.location?.town
                        }
                    },
                    customerDetails: {
                        ...element.customerDetails,
                        location: {
                            countryId: Number(element.customerDetails?.location?.countryId?.value),
                            stateId: Number(element.customerDetails?.location?.stateId?.value),
                            cityId: Number(element.customerDetails?.location?.cityId?.value),
                            town: element.customerDetails?.location?.town
                        }
                    }
                }))
            }

            let response: any = await addFeesQuery.mutateAsync(payload);

            if (response?.status) {
                toast.success(`Fees added successfully.`);
                router.push("/user/fees");
            } else {
                toast.error(response?.message);
            }

        } catch (error: any) {
            console.log(error);
            toast.error(error?.data?.message || error?.message || "Server error , please try again.");
        } finally {
            setLoadingSubmit(false);
        }
    }

    const [openSideBar, setOpenSideBar] = useState(false)

    const shouldBeDisabled = addFeesQuery?.isPending || updateFeesQuery?.isPending || loadingSubmit

    return (
        <div className="mainDashboard-body">
            <div className="custom-container">
                <section className="addRegistrationform-sec">
                    <div className="cases-page">
                        <div className="cases-header responsive1199px">
                            <h3>Fees</h3>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(formSubmit)} className="addRegistrationform-card">
                        <div className="addRegistrationform-wrapper p-3">
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Fees Name</label>
                                    <input type="text" className="form-control" {...register('feeName')} />
                                    {errors.feeName && <div className="text-danger">{errors.feeName.message}</div>}
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Fees Description</label>
                                    <textarea style={{ height: "auto" }} className="form-control" rows={4} {...register('feeDescription')} />
                                    {errors.feeDescription && <div className="text-danger">{errors.feeDescription.message}</div>}
                                </div>
                                <div className="col-md-12 mb-3">
                                    <input type="checkbox" className="mr-2" id="feeType" {...register('feeType')} />
                                    <label className="form-label mb-0" htmlFor={"feeType"}>This fee is applicable for global</label>
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Fees Policies</label>
                                    <div className="d-flex align-items-center mt-2">
                                        {
                                            watch('policyId') ? (
                                                <span className="badge bg-mute border text-dark px-3 py-2 me-3">
                                                    {policies.find(element => element.id === Number(watch('policyId')))?.categoryName}
                                                    <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={() => setValue('policyId', "")} style={{ fontSize: '0.7rem' }}></button>
                                                </span>
                                            ) : (
                                                <button className="custom-btn-skyblue" type="button" onClick={() => setOpenSideBar(true)}>
                                                    <span className="me-2">+ Add Policies</span>
                                                </button>
                                            )
                                        }
                                    </div>
                                    {errors?.policyId && <div className="text-danger mt-1 small">{errors.policyId.message}</div>}
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Menu</label>
                                    <select className="form-control" id="menuId" {...register('menuId')}>
                                        {categoryQuery?.data?.data?.children?.map((item: any) => {
                                            if (item.id == RFQ_MENU_ID) return null;

                                            return (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {
                                    fields.map((element, index) => (
                                        <div className="row mb-2" key={element.id}>
                                            <div className="col-md-12 mb-3 flex justify-between items-center">
                                                <label className="mb-0 text-2xl font-bold">Location Details {index + 1}</label>
                                                {
                                                    fields.length > 1 && (
                                                        <button className="custom-btn-skyblue" onClick={() => remove(index)}>
                                                            <TrashIcon />
                                                        </button>
                                                    )
                                                }
                                            </div>

                                            {/* Vendor Fields */}
                                            <div className="col-12">
                                                <h4>Vendor Fees</h4>
                                                <div className="p-3 bg-muted">
                                                    <div className="row">
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">Location</label>
                                                            <br />
                                                            <div className="row justify-start items-center">
                                                                {/* <div className="col-md-6">
                                                                    <input type="checkbox" id={`feeDetails.${index}.vendorDetails.isGlobal`} {...register(`feeDetails.${index}.vendorDetails.isGlobal`)} className="mr-2" />
                                                                    <label className="form-label mb-0" htmlFor={`feeDetails.${index}.vendorDetails.isGlobal`}>This price is applicable for global</label>
                                                                </div> */}
                                                                {
                                                                    !watch('feeType') ? (
                                                                        <div className="col-md-6">
                                                                            {
                                                                                watch(`feeDetails.${index}.vendorDetails.location.countryId.label`) ? (
                                                                                    <span className="badge bg-mute border text-dark px-3 py-2 me-3">
                                                                                        {element.vendorDetails?.location?.countryId?.label} - {element.vendorDetails?.location?.stateId?.label} - {element.vendorDetails?.location?.cityId?.label} - {element.vendorDetails?.location?.town}
                                                                                        <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={() => update(index, { ...element.customerDetails, vendorDetails: { ...element.vendorDetails, location: { cityId: {}, countryId: {}, stateId: {}, town: '' } } })} style={{ fontSize: '0.7rem' }}></button>
                                                                                    </span>
                                                                                ) : (
                                                                                    <button className="custom-btn-skyblue" type="button" onClick={() => setAddLocation({ show: true, locationIndex: index, locationFor: 'vendor', locationDetails: getValues(`feeDetails.${index}`) })}>+ Add Location</button>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    ) : ''
                                                                }
                                                            </div>
                                                        </div>


                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Percentage</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.vendorDetails.vendorPercentage`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorPercentage) && <div className="text-danger">{errors.feeDetails[index].vendorDetails.vendorPercentage.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Max Cap Per Deal</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.vendorDetails.vendorMaxCapPerDeal`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorMaxCapPerDeal) && <div className="text-danger">{errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorMaxCapPerDeal.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">VAT</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.vendorDetails.vendorVat`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorVat) && <div className="text-danger">{errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorVat.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Payment Gate Fee</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.vendorDetails.vendorPaymentGateFee`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorPaymentGateFee) && <div className="text-danger">{errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorPaymentGateFee.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Fix Fee</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.vendorDetails.vendorFixFee`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorFixFee) && <div className="text-danger">{errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorFixFee.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <div style={{ height: "100%", display: "flex", alignItems: "center", gap: "10px", }}>
                                                                <input type="checkbox" {...register(`feeDetails.${index}.vendorDetails.vendorMaxCapPerMonth`)} />
                                                                <label className="form-label mb-0">Max cap per month apply</label>
                                                            </div>
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorMaxCapPerMonth) && <div className="text-danger">{errors.feeDetails[index].vendorDetails && errors.feeDetails[index].vendorDetails.vendorMaxCapPerMonth.message}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Consumer Fields */}
                                            <div className="col-12 mt-2">
                                                <h4>Consumer Fees</h4>
                                                <div className="p-3 bg-muted">
                                                    <div className="row">

                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">Location</label>
                                                            <br />
                                                            <div className="row justify-start items-center">
                                                                {/* <div className="col-md-6">
                                                                    <input type="checkbox" id={`feeDetails.${index}.customerDetails.isGlobal`} {...register(`feeDetails.${index}.customerDetails.isGlobal`)} className="mr-2" />
                                                                    <label className="form-label mb-0" htmlFor={`feeDetails.${index}.customerDetails.isGlobal`}>This price is applicable for global</label>
                                                                </div> */}
                                                                {
                                                                    !watch('feeType') ? (
                                                                        <div className="col-md-6">
                                                                            {
                                                                                watch(`feeDetails.${index}.customerDetails.location.countryId.label`) ? (
                                                                                    <span className="badge bg-mute border text-dark px-3 py-2 me-3">
                                                                                        {element.vendorDetails?.location?.countryId?.label} - {element.vendorDetails?.location?.stateId?.label} - {element.vendorDetails?.location?.cityId?.label} - {element.vendorDetails?.location?.town}
                                                                                        <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={() => update(index, { ...element.vendorDetails, customerDetails: { ...element.customerDetails, location: { cityId: {}, countryId: {}, stateId: {}, town: '' } } })} style={{ fontSize: '0.7rem' }}></button>
                                                                                    </span>
                                                                                ) : (
                                                                                    <button className="custom-btn-skyblue" type="button" onClick={() => setAddLocation({ show: true, locationIndex: index, locationFor: 'customer', locationDetails: getValues(`feeDetails.${index}`) })}>+ Add Location</button>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    ) : ''
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Percentage</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.customerDetails.consumerPercentage`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerPercentage) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerPercentage.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Max Cap Per Deal</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.customerDetails.consumerMaxCapPerDeal`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerMaxCapPerDeal) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerMaxCapPerDeal.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">VAT</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.customerDetails.consumerVat`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerVat) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerVat.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Payment Gate Fee</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.customerDetails.consumerPaymentGateFee`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerPaymentGateFee) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerPaymentGateFee.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Fix Fee</label>
                                                            <input type="number" className="form-control" {...register(`feeDetails.${index}.customerDetails.consumerFixFee`)} />
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerFixFee) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerFixFee.message}</div>}
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <div style={{ height: "100%", display: "flex", alignItems: "center", gap: "10px", }}>
                                                                <input type="checkbox" {...register(`feeDetails.${index}.customerDetails.consumerMaxCapPerMonth`)} />
                                                                <label className="form-label mb-0">Max cap per month apply</label>
                                                            </div>
                                                            {(errors.feeDetails && errors.feeDetails[index] && errors.feeDetails[index].customerDetails && errors.feeDetails[index].customerDetails.consumerMaxCapPerMonth) && <div className="text-danger">{errors.feeDetails[index].customerDetails.consumerMaxCapPerMonth.message}</div>}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                        </div>

                        <div className="addRegistrationform-submit-box">
                            {!watch('feeType') && <button 
                                id="saveCustomFields" 
                                className="custom-btn-skyblue" 
                                type="button" 
                                onClick={() => append({
                                    vendorDetails: {
                                        vendorPercentage: "",
                                        vendorMaxCapPerDeal: "",
                                        vendorVat: "",
                                        vendorPaymentGateFee: "",
                                        vendorFixFee: "",
                                        vendorMaxCapPerMonth: false,
                                        isGlobal: false,
                                        location: {
                                            countryId: {},
                                            stateId: {},
                                            cityId: {},
                                            town: "",
                                        }
                                    },
                                    customerDetails: {
                                        consumerPercentage: "",
                                        consumerMaxCapPerDeal: "",
                                        consumerVat: "",
                                        consumerPaymentGateFee: "",
                                        consumerFixFee: "",
                                        consumerMaxCapPerMonth: false,
                                        isGlobal: false,
                                        location: {
                                            countryId: {},
                                            stateId: {},
                                            cityId: {},
                                            town: "",
                                        }
                                    }
                                })} 
                                disabled={shouldBeDisabled}
                            >
                                Add another location
                            </button>}
                            <button id="saveCustomFields" className="custom-btn-skyblue" type="button" onClick={() => router.goBack()} disabled={shouldBeDisabled}>
                                Cancel
                            </button>
                            <button id="saveCustomFields" className="custom-btn-skyblue" type="submit" disabled={shouldBeDisabled}>
                                {shouldBeDisabled ? "Please wait..." : "Save"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <ChooseLocation addLocation={addLocation} setAddLocation={setAddLocation} updateLocation={update} />

            <FeesSidebarSelectionModule isVisible={openSideBar} onClose={() => setOpenSideBar(false)} setFormData={setValue} />
        </div>
    );
}
