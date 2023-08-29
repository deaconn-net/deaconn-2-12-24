import { Field, useFormik } from "formik";
import React, { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import FormMain from "@components/forms/Main";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import { type Request, type Service } from "@prisma/client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Markdown from "@components/markdown/Markdown";

export default function RequestForm ({
    request,
    services = []
} : {
    request?: Request,
    services?: Service[]
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Request mutations.
    const requestMut = api.request.add.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Error Creating Or Editing Request");
    
                if (data?.code == "UNAUTHORIZED")
                    errorCtx.setMsg("You are not signed in or have permissions to create requests.")
                else
                    errorCtx.setMsg(`Error ${request ? "saving" : "creating"} request.`);
        
                // Scroll to top.
                ScrollToTop(); 
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${request ? "Saved" : "Created"} Request!`);
                successCtx.setMsg(`Request successfully ${request ? "saved" : "created"}!`);
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn = 
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{request ? "Save Request" : "Add Request"}</button>
            <button
                className="button button-secondary"
                onClick={(e) => {
                    e.preventDefault();

                    if (preview)
                        setPreview(false);
                    else
                        setPreview(true);
                }}
            >{preview ? "Preview Off" : "Preview On"}</button>
        </div>;

    // Setup form.
    const form = useFormik({
        initialValues: {
            service: request?.serviceId ?? 0,
            title: request?.title ?? "",
            startDate: new Date(request?.startDate ?? Date.now()),
            timeframe: request?.timeframe ?? 5,
            price: request?.price ?? 50.0,
            content: request?.content ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (successCtx)
                successCtx.setTitle(undefined);

            if (errorCtx)
                errorCtx.setTitle(undefined);

            requestMut.mutate({
                id: request?.id,
                userId: undefined,
                serviceId: Number(values.service),
                title: values.title,
                startDate: values.startDate,
                timeframe: Number(values.timeframe),
                price: Number(values.price),
                content: values.content
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Title</label>
                {preview ? (
                    <p className="italic">{form.values.title}</p>
                ) : (
                    <Field
                        name="title"
                        className="form-input"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Service</label>
                {preview ? (
                    <p className="italic">{form.values.service}</p>
                ) : (
                    <Field
                        name="service"
                        as="select"
                        className="form-input"
                    >
                        <>
                            <option value="0">None</option>
                            {services?.map((service: Service) => {
                                return (
                                    <option
                                        key={"service-" + service.id.toString()}
                                        value={service.id.toString()}
                                    >{service.name}</option>
                                )
                            })}
                        </>
                    </Field>
                )}

            </div>
            <div className="form-div">
                <label className="form-label">Start Date</label>
                {preview ? (
                    <p className="italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        name="startDate"
                        className="form-input"
                        selected={form.values.startDate}
                        onChange={(date: Date) => {
                            void form.setFieldValue('startDate', date);
                        }}
                        dateFormat="yyyy/MM/dd"
                    />
                )}

            </div>
            <div className="form-div">
                <label className="form-label">Timeframe</label>
                {preview ? (
                    <p className="italic">{form.values.timeframe}</p>
                ) : (
                    <Field
                        name="timeframe"
                        className="form-input"
                    />
                )}
                <p className="text-s leading-8">Value should be in <span className="font-bold">hours</span>!</p>
            </div>
            <div className="form-div">
                <label className="form-label">Price</label>
                {preview ? (
                    <p className="italic">{form.values.price}</p>
                ) : (
                    <Field
                        className="form-input"
                        name="price"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.content}
                    </Markdown>
                ) : (
                    <Field
                        name="content"
                        as="textarea"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
        </FormMain>
    );
}