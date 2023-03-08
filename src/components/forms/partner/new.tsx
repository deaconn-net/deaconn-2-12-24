import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import { getContents } from '~/utils/file_upload';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

export const PartnerForm: React.FC<{ lookupId?: number | null, lookupUrl?: string | null }> = ({ lookupId, lookupUrl }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve partner if any.
    const query = api.partner.get.useQuery({
        id: lookupId ?? null,
        url: lookupUrl ?? null
    });
    const partner = query.data;

    // Partner mutations.
    const partnerMut = api.partner.add.useMutation();

    // Check for errors or successes.
    if (partnerMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Successfully " + (Boolean(partner?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Partner successfully " + (Boolean(partner?.id) ? "saved" : "created") + "!");
        
        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    if (partnerMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Creating Or Editing Article");

        console.error(partnerMut.error.message);
        if (partnerMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create partners.")  
        else
            setErrMsg("Error creating or editing partner.");

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
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");

    if (partner && !retrievedVals) {
        setName(partner.name);
        setUrl(partner.url);

        setRetrievedVals(true);
    }

    // Setup banner image.
    const [banner, setBanner] = useState<File | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            name: name,
            url: url,
            bannerRemove: false
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            let bannerData: string | ArrayBuffer | null = null;

            // Handle banner upload if any.
            if (banner) {
                bannerData = await getContents(banner);
                bannerData = (bannerData) ? bannerData.toString().split(',')[1] ?? null : null;
            }

            // Create article.
            partnerMut.mutate({
                id: partner?.id ?? null,
                name: values.name,
                url: values.url,
                banner: bannerData?.toString(),
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
                content={<Fields 
                    setBanner={setBanner}
                    form={form}
                    preview={preview}
                />}
                submitBtn={<Button
                    preview={preview}
                    setPreview={setPreview}
                    isEdit={Boolean(partner?.id)}
                />}
            />
        </>
    );
}

const Fields: React.FC<{ setBanner: React.Dispatch<React.SetStateAction<File | null>>, preview: boolean, form: any }> = ({ setBanner, preview, form }) => {
    return (
        <>
            <div className="form-div">
                <label className="form-label">Banner</label>
                <input type="file" name="banner" onChange={(e) => {
                    const val = (e?.currentTarget?.files) ? e.currentTarget.files[0] : null;

                    setBanner(val ?? null);
                }} className="form-input" />
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
                    <Field name="name" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">URL</label>
                {preview ? (
                    <p className="text-white italic">{form.values.url}</p>
                ) : (
                    <Field name="url" className="form-input" />
                )}
                
            </div>
        </>
    )
}

const Button: React.FC<{ isEdit?: boolean, preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isEdit=false, preview, setPreview }) => {
    return (
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{isEdit ? "Save Partner" : "Add Partner"}</button>
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