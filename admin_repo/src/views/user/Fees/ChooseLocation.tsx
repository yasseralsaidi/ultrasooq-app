import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { Controller, UseFieldArrayUpdate, useForm } from 'react-hook-form';
import * as YUP from 'yup'
import Select from "react-select";
import { useGetAllCountries, useGetAllStates, useGetCities } from '../../../apis/queries/masters.queries';


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


interface CHOOSE_LOCATION_TYPE {
    addLocation: { show: boolean; locationIndex: number | null; locationFor: "customer" | "vendor" | null; locationDetails: FEE_DETAILS | null };
    setAddLocation: React.Dispatch<React.SetStateAction<{ show: boolean; locationIndex: number | null; locationFor: "customer" | "vendor" | null; locationDetails: FEE_DETAILS | null }>>;
    updateLocation: UseFieldArrayUpdate<FORM_SCHEMA, "feeDetails">;
}

const ChooseLocation: React.FunctionComponent<CHOOSE_LOCATION_TYPE> = ({ addLocation, setAddLocation, updateLocation }) => {

    const [isLoading, setIsLoading] = useState(false)

    const allCountriesQuery = useGetAllCountries();

    const customStyles = {
        control: (base: any) => ({ ...base, height: 48, minHeight: 48, }),
        menu: (base: any) => ({ ...base, zIndex: 20, }),
    };

    const formSchema = YUP.object().shape({
        countryId: YUP.object().shape({
            label: YUP.string(),
            value: YUP.string().required('Choose country for create fees')
        }).required('Choose country for create fees'),
        stateId: YUP.object().shape({
            label: YUP.string(),
            value: YUP.string().required('Choose state for create fees')
        }).required('Choose state for create fees'),
        cityId: YUP.object().shape({
            label: YUP.string(),
            value: YUP.string().required('Choose city for create fees')
        }).required('Choose city for create fees'),
        town: YUP.string().required('Provide town name for create fees'),
    })

    const { register, handleSubmit, formState: { errors }, reset, watch, control, setValue } = useForm({ resolver: yupResolver(formSchema), mode: 'all' });

    const allStatesQuery = useGetAllStates({ countryId: watch('countryId')?.value, enabled: true });
    const allCitiesQuery = useGetCities({ stateId: watch('stateId')?.value, enabled: true });

    useEffect(() => {
        if (watch('countryId')) {
            allStatesQuery.refetch()
        }
    }, [allStatesQuery, watch])

    useEffect(() => {
        if (watch('stateId')) {
            allCitiesQuery.refetch()
        }
    }, [allCitiesQuery, watch])

    const allCountriesList = useMemo(() => {
        if (allCountriesQuery?.data?.data) {
            return allCountriesQuery?.data?.data.map((data: any) => ({ label: data.name, value: data.id })) || []
        }
    }, [allCountriesQuery?.data?.data])

    const allStatesList = useMemo(() => {
        if (allStatesQuery?.data?.data) {
            return allStatesQuery?.data?.data.map((data: any) => ({ label: data.name, value: data.id })) || []
        }
    }, [allStatesQuery?.data?.data])

    const allCitiesList = useMemo(() => {
        if (allCitiesQuery?.data?.data) {
            return allCitiesQuery?.data?.data.map((data: any) => ({ label: data.name, value: data.id })) || []
        }
    }, [allCitiesQuery?.data?.data])

    const resetForm = () => {
        reset({ countryId: {}, cityId: {}, stateId: {}, town: "" })
        setAddLocation({ show: false, locationIndex: null, locationFor: null, locationDetails: null })
    }

    const onSubmit = (data: any) => {
        setIsLoading(true)
        if (addLocation.locationIndex != null) {
            if (addLocation.locationFor === 'vendor') {
                updateLocation(addLocation?.locationIndex, {
                    ...addLocation.locationDetails,
                    vendorDetails: {
                        ...addLocation.locationDetails?.vendorDetails,
                        location: { ...addLocation.locationDetails?.vendorDetails?.location, ...data }
                    }
                })
            }

            if (addLocation.locationFor === 'customer') {
                updateLocation(addLocation?.locationIndex, {
                    ...addLocation.locationDetails,
                    customerDetails: {
                        ...addLocation.locationDetails?.customerDetails,
                        location: { ...addLocation.locationDetails?.customerDetails?.location, ...data }
                    }
                })
            }
        }
        reset({ countryId: {}, cityId: {}, stateId: {}, town: "" })
        setAddLocation({ show: false, locationDetails: null, locationFor: null, locationIndex: null })
        setIsLoading(false)
    }

    return (
        <Modal size="lg" show={addLocation.show} onHide={resetForm} keyboard={false} backdrop="static" centered>
            <Modal.Header>
                <Modal.Title as="h3">Choose location for {addLocation.locationFor}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Choose country</Form.Label>
                                <Controller control={control} name='countryId' render={({ field }) => (
                                    <Select
                                        isLoading={allCountriesQuery.isLoading}
                                        ref={field.ref}
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            setValue('stateId', { label: "", value: "" })
                                            setValue('cityId', { label: "", value: "" })
                                            setValue('town', "")
                                        }}
                                        placeholder="Select country"
                                        options={allCountriesList}
                                        styles={customStyles}
                                        className="mb-3"
                                    />
                                )} />
                                {errors.countryId && <p className="text-danger">{errors.countryId.message}</p>}
                                {(errors.countryId && errors.countryId.value) ? <p className="text-danger">{errors.countryId.value.message}</p> : ''}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Choose state</Form.Label>
                                <Controller control={control} name='stateId' render={({ field }) => (
                                    <Select
                                        isClearable={true}
                                        isLoading={allStatesQuery.isLoading}
                                        ref={field.ref}
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            setValue('cityId', { label: "", value: "" })
                                            setValue('town', "")
                                        }}
                                        placeholder="Select state"
                                        options={allStatesList}
                                        styles={customStyles}
                                        className="mb-3"
                                    />
                                )} />
                                {errors.stateId && <p className="text-danger">{errors.stateId.message}</p>}
                                {(errors.stateId && errors.stateId.value) && <p className="text-danger">{errors.stateId.value.message}</p>}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Choose city</Form.Label>
                                <Controller control={control} name='cityId' render={({ field }) => (
                                    <Select
                                        isClearable={true}
                                        isLoading={allCitiesQuery.isLoading}
                                        ref={field.ref}
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            setValue('town', "")
                                        }}
                                        placeholder="Select state"
                                        options={allCitiesList}
                                        styles={customStyles}
                                        className="mb-3"
                                    />
                                )} />
                                {errors.cityId && <p className="text-danger">{errors.cityId.message}</p>}
                                {(errors.cityId && errors.cityId.value) && <p className="text-danger">{errors.cityId.value.message}</p>}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Enter location</Form.Label>
                                <Form.Control type="text" placeholder="Enter your town" {...register('town')} />
                                {errors.town && <p className="text-danger">{errors.town.message}</p>}
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => resetForm()}>Close</Button>
                    <Button variant="dark" type="submit" size="sm" disabled={isLoading}>
                        {isLoading ? "Please wait..." : 'Save location'}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default ChooseLocation
