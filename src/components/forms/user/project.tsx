import React, { useContext, useEffect, useState } from "react";
import { Field, useFormik } from "formik";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserProjectWithSourcesAndUser, type UserProjectWithSources } from "~/types/user/project";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import { ScrollToTop } from "@utils/scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Markdown from "@components/markdown/markdown";

const DEFAULT_SOURCE = {
    projectId: 0,
    title: "",
    url: ""
};

const UserProjectForm: React.FC<{
    project?: UserProjectWithSources | UserProjectWithSourcesAndUser
}> = ({
    project
}) => {
    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Request mutations.
    const projectMut = api.user.addProject.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (projectMut.isError && errorCtx) {
            console.error(projectMut.error.message);
    
            errorCtx.setTitle(`Error ${project ? "Saving" : "Creating"} Project`);
            errorCtx.setMsg(`Error ${project ? "saving" : "creating"} project. Read developer console for more information.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    
        if (projectMut.isSuccess && successCtx) {   
            successCtx.setTitle(`Successfully ${project ? "Saved" : "Created"} Project!`);
            successCtx.setMsg(`Your project was ${project ? "saved" : "created"} successfully!`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [project, projectMut, errorCtx, successCtx])

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
            details: project?.details ?? "",
            openSource: project?.openSource ?? true,
            sources: project?.sources ?? [DEFAULT_SOURCE]
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

            projectMut.mutate({
                id: project?.id,
                startDate: values.startDate || null,
                endDate: values.endDate || null,
                name: values.name,
                desc: values.desc,
                details: values.details,
                openSource: values.openSource,

                sources: values.sources
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
                <label className="form-label">Short Description</label>
                {preview ? (
                    <p className="italic">{form.values.desc}</p>
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
            <div className="form-div">
                <label>Details</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.details}
                    </Markdown>
                ) : (
                    <Field
                        name="details"
                        as="textarea"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
            <div className="form-div">
                <label>Open Source</label>
                {preview ? (
                    <p className="italic">{(form.values.openSource) ? "Yes" : "No"}</p>
                ) : (
                    <div className="form-checkbox">
                        <Field
                            name="openSource"
                            type="checkbox"
                        />
                        <span>Yes</span>
                    </div>
                )}
            </div>
            <h2>Sources</h2>
            <div className="form-div">
                {form.values.sources.map((source, index) => {
                    return (
                        <div
                            key={`source-${index.toString()}`}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label>Title</label>
                                <Field
                                    name={`sources[${index.toString()}].title`}
                                    value={source.title ?? ""}
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label>URL</label>
                                <Field
                                    name={`sources[${index.toString()}].url`}
                                    value={source.url ?? ""}
                                    className="form-input"
                                />
                            </div>
                            <button
                                className="button button-danger sm:w-32"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Remove from form values.
                                    const sources = form.values.sources;
                                    sources.splice(index, 1);

                                    form.setValues({
                                        ...form.values,
                                        sources
                                    });
                                }}
                            >Remove</button>
                        </div>
                    );
                })}

                <button
                    className="button button-priamry sm:w-32"
                    onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            sources: [...form.values.sources, DEFAULT_SOURCE]
                        });
                    }}
                >Add Source!</button>
            </div>
        </FormMain>
    );
}

export default UserProjectForm;