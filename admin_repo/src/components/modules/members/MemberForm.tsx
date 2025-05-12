import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form, InputGroup } from "react-bootstrap";
import Loader from "../../../utils/Loader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateMember, useMember, useUpdateMember } from "../../../apis/queries/members.queries";
import { useRoles } from "../../../apis/queries/roles.queries";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import 'react-phone-number-input/style.css';
import PhoneInput from "react-phone-number-input";
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form-core'
import PhoneInputWithCountrySelect from "react-phone-number-input";
import { getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/min";


type MemberFormProps = {
    show: boolean;
    action: "add" | "edit",
    memberId?: number,
    handleClose: (memberId?: number) => void;
};

const MemberForm: React.FC<MemberFormProps> = ({ show, action, memberId, handleClose }) => {
    const memberForm = Yup.object().shape({
        firstName: Yup.string().required("First name is required"),

        lastName: Yup.string().required("Last name is required"),

        email: Yup.string()
            .when([], ([], schema) => {
                return action == "add" ? schema.email().required("Email is required") : schema;
            }),

        password: Yup.string()
            .when([], ([], schema) => {
                return action == "add" ? schema.required("Password is required") : schema;
            }),

        cc: Yup.string().matches(/^(\+?\d{1,3}|\d{1,4})$/, "Invalid")
            .nullable()
            .transform((value) => value || null),

        phoneNumber: Yup.number()
            .test('len', 'Phone must be equal to or less than 20 digits', (val) => String(val || '').trim().length <= 20)
            .test('len', 'Phone must be equal to or greater than 8 digits', (val) => String(val || '').trim().length >= 8)
            .typeError("Phone must be a number")
            .nullable()
            .moreThan(0, "Phone number can not be negative")
            .transform((_, val) => (val !== "" ? Number(val) : null)),

        adminRoleId: Yup.number().transform((value) => Number.isNaN(value) ? null : value).nullable(),
    });

    const queryClient = useQueryClient();
    const [isLoadingMember, setIsLoadingMember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [roles, setRoles] = useState([]);
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues
    } = useForm({
        resolver: yupResolver(memberForm),
        mode: "all"
    });

    const rolesQuery = useRoles({
        page: 1,
        limit: 100
    });

    const memberQuery = useMember(memberId || 0, isLoadingMember)
    const createMember = useCreateMember();
    const updateMember = useUpdateMember();

    useEffect(() => {
        setRoles(rolesQuery?.data?.data?.map((role: any) => {
            return {
                label: role.adminRoleName,
                value: role.id
            }
        }) || [])
    }, [rolesQuery?.data?.data]);

    useEffect(() => {
        if (memberQuery?.data?.data?.id) {
            setValue("firstName", memberQuery?.data?.data?.userDetail?.firstName);
            setValue("lastName", memberQuery?.data?.data?.userDetail?.lastName);
            setValue("cc", memberQuery?.data?.data?.userDetail?.cc);
            setValue("phoneNumber", memberQuery?.data?.data?.userDetail?.phoneNumber);
            setValue("adminRoleId", memberQuery?.data?.data?.adminRoleId);
            setPhoneNumber('+' + memberQuery?.data?.data?.userDetail?.cc + memberQuery?.data?.data?.userDetail?.phoneNumber);
        }
    }, [memberQuery?.data?.data]);

    useEffect(() => {
        if (memberId) {
            setIsLoadingMember(true);
            queryClient.invalidateQueries({ queryKey: ["member"] });
        }
    }, []);

    const resetForm = () => {
        reset();
        handleClose();
    };

    const onSubmit = async (formData: any) => {
        if (!isValidPhoneNumber(phoneNumber)) {
            return false;
        }

        setIsLoading(true);
        try {
            formData.phoneNumber = formData.phoneNumber ? String(formData.phoneNumber) : null;
            let response;
            if (action == "add") {
                response = await createMember.mutateAsync(formData);
            } else {
                formData.adminMemberId = memberId;
                response = await updateMember.mutateAsync(formData);
            }
            if (response?.status) {
                toast.success(`Member ${action == "edit" ? "updated" : "added"} successfully`);
                handleClose(action == "add" ? response?.data.id : memberId);
                reset();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={resetForm}
            keyboard={false}
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title as="h3">{`${action == "edit" ? "Edit" : "Add"} Member`}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row>
                        <Col md={12} className="mb-4">
                            <Form.Group className="mb-0">
                                <Form.Label htmlFor="firstName">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="firstName"
                                    {...register("firstName")}
                                />
                            </Form.Group>
                            {errors.firstName && (
                                <p className="text-danger position-absolute">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </Col>

                        <Col md={12} className="mb-4">
                            <Form.Group className="mb-0">
                                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="lastName"
                                    {...register("lastName")}
                                />
                            </Form.Group>
                            {errors.lastName && (
                                <p className="text-danger position-absolute">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </Col>

                        {action == "add" ? (<Col md={12} className="mb-4">
                            <Form.Group className="mb-0">
                                <Form.Label htmlFor="email">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="email"
                                    {...register("email")}
                                    placeholder="Email"
                                />
                            </Form.Group>
                            {errors.email && (
                                <p className="text-danger position-absolute">
                                    {errors.email.message}
                                </p>
                            )}
                        </Col>) : null}

                        {action == "add" ? (<Col md={12} className="mb-4">
                            <Form.Group className="mb-0">
                                <Form.Label htmlFor="password">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                    autoComplete="off"
                                />
                            </Form.Group>
                            {errors.password && (
                                <p className="text-danger position-absolute">
                                    {errors.password.message}
                                </p>
                            )}
                        </Col>) : null}

                        <Col md={12} className="mb-4">
                            <Form.Group className="mb-0">
                                <Form.Label htmlFor="phoneNumber">Phone Number</Form.Label>
                                <PhoneInput
                                    defaultCountry="AE"
                                    placeholder="Enter Phone Number"
                                    value={phoneNumber}
                                    onCountryChange={(country) => {
                                        if (country) {
                                            const code = getCountryCallingCode(country);
                                            setValue('cc', code);
                                            setPhoneNumber(`+${code}${getValues('phoneNumber')}`);
                                        }
                                    }}
                                    onChange={(value) => {
                                        try {
                                            const phone = parsePhoneNumber(String(value));
                                            setValue('cc', phone.countryCallingCode);
                                            setValue('phoneNumber', Number(phone.nationalNumber));
                                            setPhoneNumber(phone.number)
                                        } catch (error) {
                                            if (value) setPhoneNumber(String(value));
                                        }
                                    }}
                                    countryCallingCodeEditable={false}
                                    numberInputProps={{
                                        className: 'form-control'
                                    }}
                                />
                            </Form.Group>
                            {!isValidPhoneNumber(phoneNumber) && phoneNumber.length > 0 && <p className="text-danger position-absolute">
                                Invalid Phone Number
                            </p>}
                            {errors.cc && <p className="text-danger position-absolute">
                                {errors.cc.message}
                            </p>}
                            {errors.phoneNumber && <p className="text-danger position-absolute">
                                {errors.phoneNumber.message}
                            </p>}
                        </Col>

                        <Col md={12} className="mb-4">
                            <Form.Group>
                                <Form.Label htmlFor="adminRoleId">Role</Form.Label>
                                <Controller
                                    name="adminRoleId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={roles.find(
                                                (r: any) => r.value === field.value
                                            )}
                                            onChange={(e: any) => field.onChange(e?.value)}
                                            placeholder="Select Role"
                                            options={roles}
                                        />
                                    )}
                                />
                            </Form.Group>
                            {errors.adminRoleId && (
                                <p className="text-red-500 text-sm">
                                    {errors?.adminRoleId?.message}
                                </p>
                            )}
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={resetForm}>
                        Close
                    </Button>
                    <Button variant="dark" type="submit" size="sm" disabled={isLoading}>
                        {isLoading ? (
                            <Loader
                                loaderWidth="30px"
                                loaderHeight="30px"
                                position="relative"
                            />
                        ) : (
                            `${action == "edit" ? "Update" : "Add"} Member`
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default MemberForm;