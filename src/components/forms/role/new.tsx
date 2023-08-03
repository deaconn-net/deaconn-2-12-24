import { Field, useFormik } from "formik";
import React, { useState } from "react";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from '@utils/scroll';

import { type Role } from "@prisma/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const Form: React.FC<{
    role?: Role
}> = ({
    role
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Role mutations.
    const roleMut = api.admin.addRole.useMutation();

    // Check for errors or successes.
    if (roleMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Successfully " + (role ? "Saved" : "Created") + "!");
        setSucMsg("Role successfully " + (role ? "saved" : "created") + "!");

        // Scroll to top.
        ScrollToTop();
    }

    if (roleMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Creating Or Editing Role");

        console.error(roleMut.error.message);
        if (roleMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create roles.")
        else
            setErrMsg("Error creating or editing role.");

        // Scroll to top.
        ScrollToTop();
    }


    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{role ? "Save Role" : "Add Role"}</button>
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
            role: role?.id ?? "",
            title: role?.title ?? "",
            description: role?.desc ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            // Create article.
            roleMut.mutate({
                role: values.role,
                title: values.title,
                description: values.description
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
                    <label className="form-label">Name (ID)</label>
                    {preview ? (
                        <p className="italic">{form.values.role}</p>
                    ) : (
                        <Field
                            name="role"
                            className="form-input"
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
                    <label className="form-label">Description</label>
                    {preview ? (
                        <ReactMarkdown className="markdown">
                            {form.values.description}
                        </ReactMarkdown>
                    ) : (
                        <Field
                            name="description"
                            as="textarea"
                            className="form-input"
                            rows={16}
                            cols={32}
                        />
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;