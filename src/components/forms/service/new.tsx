import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

import { getContents } from '~/utils/file_upload';

export const ServiceForm: React.FC<{ lookupId?: number | null, lookupUrl?: string | null }> = ({ lookupId, lookupUrl }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve Service if any.
    const query = api.service.get.useQuery({
        id: lookupId ?? null,
        url: lookupUrl ?? null
    });
    const service = query.data;

    // Service mutations.
    const serviceMut = api.service.add.useMutation();

    // Check for errors or successes.
    if (serviceMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Successfully " + (Boolean(service?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Service successfully " + (Boolean(service?.id) ? "saved" : "created") + "!");
        
        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    if (serviceMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Creating Or Editing Service");

        console.error(serviceMut.error.message);
        if (serviceMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create services.") 
        else
            setErrMsg("Error creating or editing service.");

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    // Default values.
    const [retrievedVals, setRetrievedVals] = useState(false);
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [desc, setDesc] = useState("");
    const [install, setInstall] = useState("");
    const [features, setFeatures] = useState("");
    const [content, setContent] = useState("");
    const [gitLink, setGitLink] = useState("");
    const [openSource, setOpenSource] = useState(false);

    if (service && !retrievedVals) {
        setUrl(service.url);
        setName(service.name);
        setPrice(service.price);
        if (service.desc)
            setDesc(service.desc);
        if (service.install)
            setInstall(service.install);
        if (service.features)
            setFeatures(service.features ?? "");
        setContent(service.content);
        if (service.gitLink)
            setGitLink(service.gitLink);
        setOpenSource(service.openSource);

        setRetrievedVals(true);
    }

    // Setup banner and icons.
    const [banner, setBanner] = useState<File | null>(null);
    const [icon, setIcon] = useState<File | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            url: url,
            name: name,
            price: price,
            desc: desc,
            install: install,
            features: features,
            content: content,
            gitLink: gitLink,
            openSource: openSource
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            // Banner and icons.
            let bannerB64: string | ArrayBuffer | null = null;
            let iconB64: string | ArrayBuffer | null = null;

            // Handle banner upload if any.
            if (banner) {
                bannerB64 = await getContents(banner);
                bannerB64 = (bannerB64) ? bannerB64.toString().split(',')[1] ?? null : null;
            }

            // Handle icon upload if any.
            if (icon) {
                iconB64 = await getContents(icon);
                iconB64 = (iconB64) ? iconB64.toString().split(',')[1] ?? null : null;
            }

            serviceMut.mutate({
                url: values.url,
                name: values.name,
                price: values.price,
                desc: values.desc,
                install: values.install,
                features: values.features,
                content: values.content,
                banner: bannerB64?.toString() ?? null,
                icon: iconB64?.toString() ?? null,
                gitLink: values.gitLink,
                openSource: values.openSource
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
                content={<Fields 
                    form={form}
                    preview={preview}
                    setBanner={setBanner}
                    setIcon={setIcon}
                />}
                submitBtn={<Button
                    preview={preview}
                    setPreview={setPreview}
                    isEdit={Boolean(service?.id)}
                />}
            />
        </>
    );
}

const Fields: React.FC<{ preview: boolean, form: any, setBanner: React.Dispatch<React.SetStateAction<File | null>>, setIcon: React.Dispatch<React.SetStateAction<File | null>> }> = ({ preview, form, setBanner, setIcon }) => {
    const query = api.service.getAll.useQuery({
        limit: 1000
    });

    const services = query?.data?.items;

    return (
        <>
            <div className="form-div">
                <label className="form-label">Banner</label>
                <input type="file" name="banner" onChange={(e) => {
                    const val = (e?.currentTarget?.files) ? e.currentTarget.files[0] : null;

                    setBanner(val ?? null);
                }} className="form-input" />
            </div>
            <div className="form-div">
                <label className="form-label">Icon</label>
                <input type="file" name="icon" onChange={(e) => {
                    const val = (e?.currentTarget?.files) ? e.currentTarget.files[0] : null;

                    setIcon(val ?? null);
                }} className="form-input" />
            </div>
            <div className="form-div">
                <label className="form-label">URL</label>
                {preview ? (
                    <p className="text-white italic">{form.values.url}</p>
                ) : (
                    <Field name="url" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Name</label>
                {preview ? (
                    <p className="text-white italic">{form.values.name}</p>
                ) : (
                    <Field name="name" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Price</label>
                {preview ? (
                    <p className="text-white">{form.values.price}</p>
                ) : (
                    <Field name="price" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Description</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.desc}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="8" cols="32" name="desc" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Installation</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.install}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="install" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Features</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.features}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="features" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.content}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="content" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Git Link</label>
                {preview ? (
                    <p className="text-white italic">{form.values.gitLink}</p>
                ) : (
                    <Field name="gitLink" className="form-input" />
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
        </>
    )
}

const Button: React.FC<{ isEdit?: boolean, preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isEdit=false, preview, setPreview }) => {
    return (
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{isEdit ? "Save Service" : "Add Service"}</button>
            <button onClick={(e) => {
                e.preventDefault();

                if (preview)
                    setPreview(false);
                else
                    setPreview(true);
            }} className="ml-4 p-6 text-white text-center bg-cyan-800 rounded">{preview ? "Preview Off" : "Preview On"}</button>
        </div>
    )
}