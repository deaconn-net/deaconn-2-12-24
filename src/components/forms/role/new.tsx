import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Role } from "@prisma/client";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import Markdown from "@components/markdown/markdown";

const Form: React.FC<{
    role?: Role
}> = ({
    role
}) => {
    // Error and success handling
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Role mutations.
    const roleMut = api.admin.addRole.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (roleMut.isError && errorCtx) {    
            console.error(roleMut.error.message);
    
            errorCtx.setTitle(`Error ${role ? "Saving" : "Creating"} Role`);
    
            if (roleMut.error.data?.code == "UNAUTHORIZED")
                errorCtx.setMsg("You are not signed in or have permissions to create roles.")
            else
                errorCtx.setMsg(`Error ${role ? "saving" : "creating"} role.`);
    
            // Scroll to top.
            ScrollToTop();
        }
        if (roleMut.isSuccess && successCtx) {    
            successCtx.setTitle(`Successfully ${role ? "Saved" : "Created"} Role!`);
            successCtx.setMsg(`Role successfully ${role ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [role, roleMut, errorCtx, successCtx])

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
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

            // Create article.
            roleMut.mutate({
                role: values.role,
                title: values.title,
                description: values.description
            });
        }
    });

    return (
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
                    <Markdown>
                        {form.values.description}
                    </Markdown>
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
    );
}

export default Form;