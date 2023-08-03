import React, { useContext, useEffect, useState } from "react";
import { Field, useFormik } from "formik";

import { type UserProject } from "@prisma/client";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from "@utils/scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ReactMarkdown from "react-markdown";

const Form: React.FC<{
    project?: UserProject
}> = ({
    project
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Request mutations.
    const projectMut = api.user.addProject.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (projectMut.isSuccess && success) {   
            success.setTitle(`Successfully ${project ? "Saved" : "Created"} Project!`);
            success.setMsg(`Your project was ${project ? "saved" : "created"} successfully!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (projectMut.isError && error) {
            console.error(projectMut.error.message);

            error.setTitle(`Error ${project ? "Saving" : "Creating"} Project`);
            error.setMsg(`Error ${project ? "saving" : "creating"} project. Read developer console for more information.`);
    
            // Scroll to top.
            ScrollToTop();
        }

    }, [projectMut, success, error, project])


    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{project ? "Save" : "Add"} Project</button>
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
            startDate: new Date(project?.startDate ?? Date.now()),
            endDate: new Date(project?.endDate ?? Date.now()),
            name: project?.name ?? "",
            desc: project?.desc ?? "",
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

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
                <label className="form-label">Name</label>
                {preview ? (
                    <p className="italic">{form.values.name}</p>
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
                    <ReactMarkdown className="markdown p-4 bg-gray-800">
                        {form.values.desc}
                    </ReactMarkdown>
                ) : (
                    <Field
                        name="desc"
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

export default Form;