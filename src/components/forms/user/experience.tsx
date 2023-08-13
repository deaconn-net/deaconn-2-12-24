import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { type UserExperience } from "@prisma/client";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from "@utils/scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ReactMarkdown from "react-markdown";

const Form: React.FC<{
    experience?: UserExperience
}> = ({
    experience,
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Request mutations.
    const experienceMut = api.user.addExperience.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (experienceMut.isSuccess && success) {
            success.setTitle(`Successfully ${experience ? "Saved" : "Created"} Experience!`);
            success.setMsg(`Your experience was ${experience ? "saved" : "created"} successfully!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (experienceMut.isError && error) {
            console.error(experienceMut.error.message);

            error.setTitle(`Error ${experience ? "Saving" : "Creating"} Experience`);
            error.setMsg(`Error ${experience ? "saving" : "creating"} experience. Read developer console for more information.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [experienceMut, success, error, experience])


    // Setup preview.
    const [preview, setPreview] = useState(false);

    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{experience ? "Save" : "Add"} Experience</button>
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
            startDate: new Date(experience?.startDate ?? Date.now()),
            endDate: new Date(experience?.endDate ?? Date.now()),
            title: experience?.title ?? "",
            desc: experience?.desc ?? "",
            details: experience?.details ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

            experienceMut.mutate({
                id: experience?.id,
                startDate: values.startDate || undefined,
                endDate: values.endDate || undefined,
                title: values.title,
                desc: values.desc,
                details: values.details
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Start Date</label>
                {preview ? (
                    <p className="italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        name="startDate"
                        className="form-input"
                        selected={form.values.startDate}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date: Date) => {
                            void form.setFieldValue('startDate', date);
                        }}
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">End Date</label>
                {preview ? (
                    <p className="italic">{form.values.endDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        name="endDate"
                        className="form-input"
                        selected={form.values.endDate}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date: Date) => {
                            void form.setFieldValue('endDate', date);
                        }}
                    />
                )}
            </div>
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
                <label className="form-label">Short Description</label>
                {preview ? (
                    <p className="italic">{form.values.desc}</p>
                ) : (
                    <Field
                        as="textarea"
                        name="desc"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
                {preview ? (
                    <ReactMarkdown className="markdown p-4 bg-gray-800">
                        {form.values.details}
                    </ReactMarkdown>
                ) : (
                    <Field
                        as="textarea"
                        name="details"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
        </FormMain>
    );
}

export default Form;