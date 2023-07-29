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
        <div className="text-center">
            <button type="submit" className="button">{experience ? "Save" : "Add"} Experience</button>
            <button onClick={(e) => {
                e.preventDefault();

                if (preview)
                    setPreview(false);
                else
                    setPreview(true);
            }} className="ml-4 p-6 text-white text-center bg-cyan-800 rounded">{preview ? "Preview Off" : "Preview On"}</button>
        </div>;

    // Setup form.
    const form = useFormik({
        initialValues: {
            startDate: new Date(experience?.startDate ?? Date.now()),
            endDate: new Date(experience?.endDate ?? Date.now()),
            title: experience?.title ?? "",
            desc: experience?.desc ?? "",
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
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
                        <p className="text-white italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                    ) : (
                        <DatePicker
                            className="form-input"
                            name="startDate"
                            selected={form.values.startDate}
                            onChange={(date: Date) => form.setFieldValue('startDate', date)}
                            dateFormat="yyyy/MM/dd"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">End Date</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.endDate?.toString() ?? "Not Set"}</p>
                    ) : (
                        <DatePicker
                            className="form-input"
                            name="endDate"
                            selected={form.values.endDate}
                            onChange={(date: Date) => form.setFieldValue('endDate', date)}
                            dateFormat="yyyy/MM/dd"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Title</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.title}</p>
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
                        <ReactMarkdown className="markdown text-white">{form.values.desc}</ReactMarkdown>
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