import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useCreatePolicy, useUpdatePolicy } from "../../../apis/queries/policies.queries";
import api from "../../../services/Axios";
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import "quill-emoji/dist/quill-emoji.css"; // Import emoji styles
import "quill-emoji"; // Import emoji module

type AddPoliciesProps = {
    show: any;
    handleClose: any;
};

const AddPolicies: React.FC<AddPoliciesProps> = ({ show, handleClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = Yup.object().shape({
        ruleName: Yup.string().required("Provide the Policy name"),
        ruleCategory: Yup.string().required("Choose policy category for create new policy"),
        new_category_name: Yup.string().when("ruleCategory", {
            is: (val: string) => val === "new_category",
            then: (schema) => schema.required("Provide a new category name"),
            otherwise: (schema) => schema.notRequired(),
        }),
        rule: Yup.string().optional(),
    });

    const { register, reset, handleSubmit, formState: { errors }, setValue, control } = useForm({ resolver: yupResolver(formSchema), mode: "all" });
    const createPolicy = useCreatePolicy();
    const updatePolicy = useUpdatePolicy();

    const [categories, setCategories] = useState<{ categoryName: string; createdAt: string; deletedAt: string; id: number; parentId: number; rule: string; ruleName: string; status: string; updatedAt: string; }[]>([])
    const [choose_category, set_choose_category] = useState<string | null>(null)

    useEffect(() => {
        api.get('/policy/getAllMainPolicy').then((response) => {
            if (response.data.status) {
                setCategories(response.data.data)
                if (show?.item && !show?.edit) {
                    setValue("ruleCategory", show.item.id)
                    set_choose_category(show.item.id)
                } else {
                    set_choose_category(null)
                }
            } else {
                console.log(response)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [setValue, show])

    const resetForm = () => {
        handleClose();
        reset();
        set_choose_category(null)
    };

    const onSubmit = async (formData: any) => {
        try {
            setIsLoading(true);
            let data: any = { ruleName: formData?.ruleName, rule: formData?.rule || "" }
            if (formData.ruleCategory === "new_category") {
                data.categoryName = formData.new_category_name
            } else {
                data.parentId = Number(formData?.ruleCategory)
            }

            if (show.edit) {
                data.policyId = show.item.id
            }
            const response = show.edit ? await updatePolicy.mutateAsync(data) : await createPolicy.mutateAsync(data);
            if (response?.status) {
                toast.success(`Policy ${show.edit ? "updated" : "added"} successfully`);
                resetForm();
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (show.edit) {
            setValue("ruleName", show.item.categoryName);
            if (categories && categories.length > 0) {
                setValue("ruleCategory", show.item.parentId ? show.item.parentId : '');
            }
            setValue("rule", show.item.rule);
        }
    }, [show.item, setValue, show.edit, categories]);

    return (
        <Modal size="lg" show={show.show} onHide={resetForm} keyboard={false} backdrop="static">
            <Modal.Header>
                <Modal.Title as="h3">{show?.edit ? 'Update policy' : 'Add new policy'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Row>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label htmlFor="ruleName">Policy Name</Form.Label>
                                <Form.Control type="text" id="ruleName" {...register("ruleName")} />
                                {errors.ruleName && <p className="text-danger">{errors.ruleName.message}</p>}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label htmlFor="ruleCategory">Choose Policy Category</Form.Label>
                                <select className="custom-form-s1 select4" {...register("ruleCategory", { onChange: (event) => set_choose_category(event.target.value) })}>
                                    <option value="">Select policy category</option>
                                    {
                                        categories.map((item) => (
                                            <option key={item.id} value={item.id}>{item.categoryName}</option>
                                        ))
                                    }
                                    <option value="new_category">Other</option>
                                </select>
                                {errors.ruleCategory && <p className="text-danger">{errors.ruleCategory.message}</p>}
                            </Form.Group>
                        </Col>
                        {
                            (choose_category === "new_category") && (
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label htmlFor="new_category_name">Provide Category Name</Form.Label>
                                        <Form.Control type="text" id="new_category_name" {...register("new_category_name")} />
                                    </Form.Group>
                                    {errors.new_category_name && <p className="text-danger">{errors.new_category_name.message}</p>}
                                </Col>
                            )
                        }
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="text-sm font-medium leading-none text-color-dark">Policy Rule</Form.Label>
                                <Controller control={control} name="rule" render={({ field: { value, ref, onChange } }) => (
                                    <ReactQuill
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            ['blockquote', 'code-block'],
                                            ['link', 'image', 'video', 'formula'],
                                            [{ 'header': 1 }, { 'header': 2 }],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                                            [{ 'script': 'sub' }, { 'script': 'super' }],
                                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                                            [{ 'direction': 'rtl' }],
                                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'font': [] }],
                                            [{ 'align': [] }],
                                            ['clean'],
                                            ["emoji"], // Add the emoji button
                                        ],
                                        "emoji-toolbar": true, // Enable emoji toolbar
                                        // "emoji-textarea": true, // Enable emoji textarea
                                        "emoji-shortname": true, // Enable emoji short names
                                    }}
                                     theme="snow" value={value || ''} ref={ref} onChange={(value) => onChange(value)} />
                                )} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={resetForm}>Close</Button>
                    <Button variant="dark" type="submit" size="sm" disabled={isLoading}>
                        {isLoading ? "Please wait..." : `${show?.edit ? 'Update policy' : 'Add policy'}`}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPolicies;
