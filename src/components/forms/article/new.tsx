import { Field, useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';

import { type Article } from '@prisma/client';
import { type CategoryWithChildren } from '~/types/category';

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from '@components/wrapper';

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import Markdown from '@components/markdown/markdown';

const Form: React.FC<{
    article?: Article,
    categories?: CategoryWithChildren[]
}> = ({
    article,
    categories = []
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Article mutations.
    const articleMut = api.blog.add.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (articleMut.isSuccess && success) {
            success.setTitle(`Successfully ${article ? "Saved" : "Created"} Article`);
            success.setMsg(`Article successfully ${article ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (articleMut.isError && error) {
            const errorMsg = articleMut.error.message;

            console.error(errorMsg);

            error.setTitle(`Error ${article ? "Saving" : "Creating"} Article`);
    
            if (articleMut.error.data?.code == "UNAUTHORIZED")
                error.setMsg("You are not signed in or have permissions to create articles on our blog.");
            else if (errorMsg.includes("constraint"))
                error.setMsg("URL is already in use. Please choose a different URL or modify the existing article properly.");
            else
                error.setMsg(`Error ${article ? "saving" : "creating"} article.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [articleMut, success, error, article]);


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
            category: article?.categoryId ?? 0,
            url: article?.url ?? "",
            title: article?.title ?? "",
            desc: article?.desc ?? "",
            content: article?.content ?? "",
            bannerRemove: false
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

            // Create article.
            articleMut.mutate({
                id: article?.id,
                category: Number(values.category) || null,
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
                <label className="form-label">Category</label>
                {preview ? (
                    <p className="italic">{form.values.category}</p>
                ) : (
                    <select
                        name="category"
                        value={form.values.category}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        className="form-input"
                    >
                        <option value={0}>None</option>
                        {categories.map((category) => {
                            return (
                                <React.Fragment key={`article-category-${category.id.toString()}`}>
                                    <option value={category.id}>{category.name}</option>

                                    {category.children.map((categoryChild) => {
                                        return (
                                            <option
                                                key={`article-category-${categoryChild.id.toString()}`}
                                                value={categoryChild.id}
                                            >&nbsp;&nbsp;&nbsp;&nbsp;{"->"} {categoryChild.name}</option>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </select>
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
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.content}
                    </Markdown>
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
    );
}

export default Form;