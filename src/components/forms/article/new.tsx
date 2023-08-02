import { Field, useFormik } from 'formik';
import React, { useState } from 'react';

import { type Article } from '@prisma/client';

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from '@utils/scroll';

import ReactMarkdown from 'react-markdown';

const Form: React.FC<{
    article?: Article
}> = ({
    article
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Article mutations.
    const articleMut = api.blog.add.useMutation();

    // Check for errors or successes.
    if (articleMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Successfully " + (Boolean(article?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Article successfully " + (Boolean(article?.id) ? "saved" : "created") + "!");

        // Scroll to top.
        ScrollToTop();
    }

    if (articleMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Creating Or Editing Article");

        console.error(articleMut.error.message);
        if (articleMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create articles on our blog.")
        else if (articleMut.error.message.includes("constraint"))
            setErrMsg("URL is already in use. Please choose a different URL or modify the existing article properly.")
        else
            setErrMsg("Error creating or editing article.");

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
            >{article ? "Save Article" : "Add Article"}</button>
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
            url: article?.url ?? "",
            title: article?.title ?? "",
            desc: article?.desc ?? "",
            content: article?.content ?? "",
            bannerRemove: false
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            // Create article.
            articleMut.mutate({
                id: article?.id,
                url: values.url,
                title: values.title,
                desc: values.desc,
                content: values.content,
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
                    <label 
                        className="form-label"
                    >Banner</label>
                    <input
                        name="banner"
                        className="form-input"
                        type="file"
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
                    {article?.banner && (
                        <>
                            {preview ? (
                                <>
                                    <label className="form-label">Remove Banner</label>
                                    <p className="italic">{form.values.bannerRemove ? "Yes" : "No"}</p>
                                </>
                            ) : (
                                <>
                                    <Field
                                        name="bannerRemove"
                                        type="checkbox"
                                    /> <span>Remove Banner</span>
                                </>
                            )}
                        </>
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
                        <p>{form.values.desc}</p>
                    ) : (
                        <Field
                            name="desc"
                            as="textarea"
                            className="form-input"
                            rows="8"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Content</label>
                    {preview ? (
                        <ReactMarkdown className="markdown p-4 bg-gray-800">
                            {form.values.content}
                        </ReactMarkdown>
                    ) : (
                        <Field
                            name="content"
                            as="textarea"
                            className="form-input"
                            rows="16"
                            cols="32"
                        />
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;