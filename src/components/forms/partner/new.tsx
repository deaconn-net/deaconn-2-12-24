import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import { type Partner } from "@prisma/client";

const Form: React.FC<{
    partner?: Partner
}> = ({
    partner
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Partner mutations.
    const partnerMut = api.partner.add.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (partnerMut.isError && errorCtx) {
            console.error(partnerMut.error.message);
    
            errorCtx.setTitle(`Error ${partner ? "Saving" : "Creating"} Partner`);
    
            if (partnerMut.error.data?.code == "UNAUTHORIZED")
                errorCtx.setMsg("You are not signed in or have permissions to create partners.")
            else
                errorCtx.setMsg(`Error ${partner ? "saving" : "creating"} partner.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    
        if (partnerMut.isSuccess && successCtx) {
    
            successCtx.setTitle(`Successfully ${partner ? "Saved" : "Created"} Partner!`);
            successCtx.setMsg(`Partner successfully ${partner ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [partner, partnerMut, errorCtx, successCtx])

    // Setup banner image.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{partner ? "Save Partner" : "Add Partner"}</button>
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
            name: partner?.name ?? "",
            url: partner?.url ?? "",
            bannerRemove: false
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

            // Create article.
            partnerMut.mutate({
                id: partner?.id,
                name: values.name,
                url: values.url,
                banner: banner?.toString(),
                bannerRemove: values.bannerRemove
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Banner</label>
                <input
                    name="banner"
                    type="file"
                    className="form-input"
                    onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {
                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setBanner(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }}
                />
                {partner?.banner && (
                    <>
                        {preview ? (
                            <>
                                <label>Remove Banner</label>
                                <p className="italic">{form.values.bannerRemove ? "Yes" : "No"}</p>
                            </>
                        ) : (
                            <div className="form-checkbox">
                                <Field
                                    name="bannerRemove"
                                    type="checkbox"
                                /> <span>Remove Banner</span>
                            </div>
                        )}
                    </>
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
                <label className="form-label">URL</label>
                {preview ? (
                    <p className="italic">{form.values.url}</p>
                ) : (
                    <Field
                        name="url"
                        className="form-input"
                    />
                )}
            </div>
        </FormMain>
    );
}

export default Form;