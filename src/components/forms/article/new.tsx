import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { getContents } from '~/utils/file_upload';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

export const ArticleForm: React.FC<{ lookupId?: number | null, lookupUrl?: string | null }> = ({ lookupId, lookupUrl }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve article if any.
    const query = api.blog.get.useQuery({
        id: lookupId ?? null,
        url: lookupUrl ?? null,

        selViews: false
    });
    const article = query.data;

    // Article mutations.
    const articleMut = api.blog.add.useMutation();

    // Check for errors or successes.
    if (articleMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Successfully " + (Boolean(article?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Article successfully " + (Boolean(article?.id) ? "saved" : "created") + "!");

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
    }

    if (articleMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Creating Or Editing Article");

        console.error(articleMut.error.message);
        if (articleMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create articles on our blog.")
        else if (articleMut.error.message.includes("constraint"))
            setErrMsg("URL is already in use. Please choose a different URL or modify the existing article properly.")
        else
            setErrMsg("Error creating or editing article.");

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
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [content, setContent] = useState("");

    if (article && !retrievedVals) {
        setUrl(article.url);
        setTitle(article.title);

        if (article.desc)
            setDesc(article.desc);

        setContent(article.content);

        setRetrievedVals(true);
    }

    // Setup banner image.
    const [banner, setBanner] = useState<File | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            url: url,
            title: title,
            desc: desc,
            content: content,
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
            articleMut.mutate({
                id: article?.id ?? null,
                url: values.url,
                title: values.title,
                desc: values.desc,
                content: values.content,
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
                    isEdit={Boolean(article?.id)}
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
                <label className="form-label">URL</label>
                {preview ? (
                    <p className="text-white italic">{form.values.url}</p>
                ) : (
                    <Field name="url" className="form-input" />
                )}

            </div>
            <div className="form-div">
                <label className="form-label">Title</label>
                {preview ? (
                    <p className="text-white italic">{form.values.title}</p>
                ) : (
                    <Field name="title" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Description</label>
                {preview ? (
                    <p className="text-white">{form.values.desc}</p>
                ) : (
                    <Field as="textarea" rows="8" cols="32" name="desc" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Content</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.content}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="content" className="form-input" />
                )}
            </div>
        </>
    )
}

const Button: React.FC<{ isEdit?: boolean, preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isEdit = false, preview, setPreview }) => {
    return (
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{isEdit ? "Save Article" : "Add Article"}</button>
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