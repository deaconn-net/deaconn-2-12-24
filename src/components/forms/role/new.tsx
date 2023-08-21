import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { type Role } from "@prisma/client";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import Markdown from "@components/markdown/markdown";

const Form: React.FC<{
    role?: Role
}> = ({
    role
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Role mutations.
    const roleMut = api.admin.addRole.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (roleMut.isSuccess && success) {    
            success.setTitle(`Successfully ${role ? "Saved" : "Created"} Role!`);
            success.setMsg(`Role successfully ${role ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (roleMut.isError && error) {    
            console.error(roleMut.error.message);

            error.setTitle(`Error ${role ? "Saving" : "Creating"} Role`);
    
            if (roleMut.error.data?.code == "UNAUTHORIZED")
                error.setMsg("You are not signed in or have permissions to create roles.")
            else
                error.setMsg(`Error ${role ? "saving" : "creating"} role.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    
    }, [roleMut, success, error, role])


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
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

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