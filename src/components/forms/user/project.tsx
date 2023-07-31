import React, { useState } from "react";
import { Field, useFormik } from "formik";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from "@utils/scroll";

import ReactMarkdown from "react-markdown";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { UserProject } from "@prisma/client";

const Form: React.FC<{
    project?: UserProject
}> = ({
    project
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Request mutations.
    const projectMut = api.user.addProject.useMutation();

    // Check for errors or successes.
    if (projectMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Project Added!");
        setSucMsg("Your project was added or saved successfully!");

        // Scroll to top.
        ScrollToTop();
    }

    if (projectMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Adding Or Saving Project");
        setErrMsg("Error adding or editing project. Read developer console for more information.");

        console.error(projectMut.error.message);

        // Scroll to top.
        ScrollToTop();
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button type="submit" className="button button-primary">{project ? "Save" : "Add"} Project</button>
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
            startDate: new Date(project?.startDate ?? Date.now()),
            endDate: new Date(project?.endDate ?? Date.now()),
            name: project?.name ?? "",
            desc: project?.desc ?? "",
        },
        enableReinitialize: false,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            projectMut.mutate({
                id: project?.id,
                startDate: values.startDate,
                endDate: values.endDate,
                name: values.name,
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
                    <label className="form-label">Name</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.name}</p>
                    ) : (
                        <Field
                            name="name"
                            className="form-input"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Details</label>
                    {preview ? (
                        <ReactMarkdown
                            className="markdown text-white"
                        >{form.values.desc}</ReactMarkdown>
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