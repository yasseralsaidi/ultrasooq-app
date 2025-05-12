import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useReplyToQuery } from "../../../apis/queries/help-center.queries";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledTextArea from "../../shared/Forms/ControlledTextArea";
import { toast } from "react-toastify";

type AnswerFormProps = {
    query: any;
    show: boolean;
    onHide: () => void;
};

const formSchema = yup.object().shape({
    query: yup.string(),
    response: yup.string().required("Response is required"),
});

const AnswerForm: React.FC<AnswerFormProps> = ({
    query,
    show,
    onHide,
    ...props
}) => {
    const form = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: {
            query: query.query,
            response: query.response || ''
        }
    });

    const replyToQuery = useReplyToQuery();

    const onSubmit = async (formData: any) => {
        const response = await replyToQuery.mutateAsync({
            helpCenterId: query.id,
            response: formData.response
        });

        if (response.status && response.data) {
            toast.success(response.message);
            onHide();
        } else {
            toast.error(response.message);
        }
    }

    return (
        <>
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
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(onSubmit)}>
                        <Modal.Header>
                            <h5 id="contained-modal-title-vcenter">Reply</h5>
                            <button
                                type="button"
                                className="customModal4-close"
                                onClick={() => {
                                    onHide();
                                    form.reset({
                                        query: "",
                                        response: ""
                                    });
                                }}
                            >
                                <img src="/images/close.svg" alt="close-icon" />
                            </button>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label htmlFor="query">Query</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    {...form.register("query")}
                                    disabled={true}
                                    style={{ height: "auto" }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="answer">Reply</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    {...form.register("response")}
                                    placeholder="Enter your reply"
                                    style={{ height: "auto" }}
                                    disabled={query.response}
                                />
                                <p className="text-red-500 text-sm">
                                    {form.formState.errors?.response?.message}
                                </p>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="modal-form-submit-actions">
                                <Button
                                    variant="dark"
                                    size="sm"
                                    onClick={() => {
                                        onHide();
                                        form.reset({
                                            query: "",
                                            response: ""
                                        });
                                    }}
                                    className="cancel-btn"
                                >
                                    Close
                                </Button>
                                {!query.response && <Button
                                    type="submit"
                                    size="sm"
                                    className="save-btn"
                                    disabled={replyToQuery.isPending}
                                >
                                    Reply
                                </Button>}
                            </div>
                        </Modal.Footer>
                    </Form>
                </FormProvider>
            </Modal>
        </>
    );
}

export default AnswerForm;