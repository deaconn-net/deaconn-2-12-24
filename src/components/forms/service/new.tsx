import React, { useState } from "react";
import { Field, useFormik } from "formik";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from '@utils/scroll';

import ReactMarkdown from "react-markdown";
import { Service } from "@prisma/client";

const Form: React.FC<{
    service?: Service | null
}> = ({
    service
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Service mutations.
    const serviceMut = api.service.add.useMutation();

    // Check for errors or successes.
    if (serviceMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Successfully " + (Boolean(service?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Service successfully " + (Boolean(service?.id) ? "saved" : "created") + "!");

        // Scroll to top.
        ScrollToTop();
    }

    if (serviceMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Creating Or Editing Service");

        console.error(serviceMut.error.message);
        if (serviceMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create services.")
        else
            setErrMsg("Error creating or editing service.");

        // Scroll to top.
        ScrollToTop();
    }

    // Setup banner and icons.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{service ? "Save Service" : "Add Service"}</button>
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
            url: service?.url ?? "",
            name: service?.name ?? "",
            price: service?.price ?? 0,
            desc: service?.desc ?? "",
            install: service?.install ?? "",
            features: service?.features ?? "",
            content: service?.content ?? "",
            gitLink: service?.gitLink ?? "",
            openSource: service?.openSource ?? true,
            bannerRemove: false,
            iconRemove: false
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            serviceMut.mutate({
                id: service?.id,
                url: values.url,
                name: values.name,
                price: Number(values.price),
                desc: values.desc,
                install: values.install,
                features: values.features,
                content: values.content,
                banner: banner?.toString(),
                icon: icon?.toString(),
                gitLink: values.gitLink,
                openSource: values.openSource,
                bannerRemove: values.bannerRemove,
                iconRemove: values.iconRemove
            })
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
                    <label className="form-label">Icon</label>
                    <input
                        type="file"
                        name="icon"
                        className="form-input"
                        onChange={(e) => {
                            const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                            if (file) {
                                const reader = new FileReader();

                                reader.onloadend = () => {
                                    setIcon(reader.result);
                                };
                                
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {preview ? (
                        <>
                            <h2 className="text-white font-bold">Remove Icon</h2>
                            <p className="text-white italic">{form.values.iconRemove ? "Yes" : "No"}</p>
                        </>
                    ) : (
                        <>
                            <Field
                                name="iconRemove"
                                type="checkbox"
                            /> <span className="text-white">Remove Icon</span>
                        </>
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
                    <label className="form-label">Price</label>
                    {preview ? (
                        <p className="text-white">{form.values.price}</p>
                    ) : (
                        <Field
                            name="price"
                            className="form-input"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Description</label>
                    {preview ? (
                        <ReactMarkdown className="markdown text-white">{form.values.desc}</ReactMarkdown>
                    ) : (
                        <Field
                            as="textarea"
                            name="desc"
                            className="form-input"
                            rows="8"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Installation</label>
                    {preview ? (
                        <ReactMarkdown className="markdown text-white">{form.values.install}</ReactMarkdown>
                    ) : (
                        <Field
                            as="textarea"
                            name="install"
                            className="form-input"
                            rows="16"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Features</label>
                    {preview ? (
                        <ReactMarkdown className="markdown text-white">{form.values.features}</ReactMarkdown>
                    ) : (
                        <Field
                            as="textarea"
                            name="features"
                            className="form-input"
                            rows="16"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Details</label>
                    {preview ? (
                        <ReactMarkdown className="markdown text-white">{form.values.content}</ReactMarkdown>
                    ) : (
                        <Field
                            as="textarea"
                            name="content"
                            className="form-input"
                            rows="16"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Git Link</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.gitLink}</p>
                    ) : (
                        <Field
                            name="gitLink"
                            className="form-input"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Open Source</label>
                    {preview ? (
                        <p className="text-white italic">{(form.values.openSource) ? "Yes" : "No"}</p>
                    ) : (
                        <>
                            <Field
                                name="openSource"
                                type="checkbox"
                            /> <span className="text-white">Yes</span>
                        </>
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;