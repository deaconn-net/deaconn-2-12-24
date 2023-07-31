import { Field, useFormik } from "formik";
import React, { useState } from "react";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from '@utils/scroll';

import { Partner } from "@prisma/client";

const Form: React.FC<{
    partner?: Partner | null
}> = ({
    partner
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Partner mutations.
    const partnerMut = api.partner.add.useMutation();

    // Check for errors or successes.
    if (partnerMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Successfully " + (Boolean(partner?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Partner successfully " + (Boolean(partner?.id) ? "saved" : "created") + "!");

        // Scroll to top.
        ScrollToTop();
    }

    if (partnerMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Creating Or Editing Article");

        console.error(partnerMut.error.message);
        if (partnerMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create partners.")
        else
            setErrMsg("Error creating or editing partner.");

        // Scroll to top.
        ScrollToTop();
    }

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

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

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
                    <label className="form-label">Banner</label>
                    <input
                        type="file"
                        name="banner"
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
                    {preview ? (
                        <>
                            <h2 className="text-white font-bold">Remove Banner</h2>
                            <p className="text-white italic">{form.values.bannerRemove ? "Yes" : "No"}</p>
                        </>
                    ) : (
                        <>
                            <Field
                                name="bannerRemove"
                                type="checkbox"
                            /> <span className="text-white">Remove Banner</span>
                        </>
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
                    <label className="form-label">URL</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.url}</p>
                    ) : (
                        <Field
                            name="url"
                            className="form-input"
                        />
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;