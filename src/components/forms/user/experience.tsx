import { Field, useFormik } from "formik";
import React, { useState } from "react";

import { type UserExperience } from "@prisma/client";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from "@utils/scroll";

import ReactMarkdown from "react-markdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Form: React.FC<{
    experience?: UserExperience
}> = ({
    experience,
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Request mutations.
    const experienceMut = api.user.addExperience.useMutation();

    // Check for errors or successes.
    if (experienceMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Experience Added!");
        setSucMsg("Your experience was added or saved successfully!");

        // Scroll to top.
        ScrollToTop();
    }

    if (experienceMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Adding Or Saving Experience");
        setErrMsg("Error adding or editing experience. Read developer console for more information.");

        console.error(experienceMut.error.message);

        // Scroll to top.
        ScrollToTop();
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button type="submit" className="button button-primary">{experience ? "Save" : "Add"} Experience</button>
            <button onClick={(e) => {
                e.preventDefault();

                if (preview)
                    setPreview(false);
                else
                    setPreview(true);
            }} className="button button-secondary">{preview ? "Preview Off" : "Preview On"}</button>
        </div>;

    // Setup form.
    const form = useFormik({
        initialValues: {
            startDate: new Date(experience?.startDate ?? Date.now()),
            endDate: new Date(experience?.endDate ?? Date.now()),
            title: experience?.title ?? "",
            desc: experience?.desc ?? "",
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            experienceMut.mutate({
                id: experience?.id,
                startDate: values.startDate,
                endDate: values.endDate,
                title: values.title,
                desc: values.desc
            });
        }
    });

    return (
        <>
            <ErrorBox
                title={errTitle}
                msg={errMsg}
            />
            <SuccessBox
                title={sucTitle}
                msg={sucMsg}
            />
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
                            onChange={(date: Date) => {
                                void form.setFieldValue('startDate', date);
                            }}
                            dateFormat="yyyy/MM/dd"
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
                            onChange={(date: Date) => {
                                void form.setFieldValue('endDate', date);
                            }}
                            dateFormat="yyyy/MM/dd"
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
                    <label className="form-label">Details</label>
                    {preview ? (
                        <ReactMarkdown className="markdown">{form.values.desc}</ReactMarkdown>
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
            </FormMain>
        </>
    );
}

export default Form;