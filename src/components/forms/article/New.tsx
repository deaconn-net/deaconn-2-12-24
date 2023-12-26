import { Field, Form, Formik } from 'formik';
import React, { useContext, useState } from 'react';

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Article } from '@prisma/client';
import { type CategoryWithChildren } from '~/types/category';

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import Markdown from '@components/markdown/Markdown';

export default function ArticleForm ({
    article,
    categories = []
} : {
    article?: Article,
    categories?: CategoryWithChildren[]
}){
    // Success and error handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Article mutations.
    const articleMut = api.blog.add.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${article ? "Saving" : "Creating"} Article`);
    
                if (data?.code == "UNAUTHORIZED")
                    errorCtx.setMsg("You are not signed in or have permissions to create articles on our blog.");
                else if (message.includes("constraint"))
                    errorCtx.setMsg("URL is already in use. Please choose a different URL or modify the existing article properly.");
                else
                    errorCtx.setMsg(`Error ${article ? "saving" : "creating"} article.`);

                // Scroll to top.
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${article ? "Saved" : "Created"} Article`);
                successCtx.setMsg(`Article successfully ${article ? "saved" : "created"}!`);

                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup banner image.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    return (
        <Formik
            initialValues={{
                category: article?.categoryId ?? 0,
                url: article?.url ?? "",
                title: article?.title ?? "",
                desc: article?.desc ?? "",
                content: article?.content ?? "",
                bannerRemove: false
            }}
            onSubmit={(values) => {
                // Reset error and success.
                if (errorCtx)
                    errorCtx.setTitle(undefined);
    
                if (successCtx)
                    successCtx.setTitle(undefined);
    
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
            }}
        >
            {(form) => (
                <Form>
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
                            <Markdown className="p-4">
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
                    <div className="flex gap-2 justify-center">
                        <button 
                            type="submit"
                            className="button button-primary"
                        >{article ? "Save Article" : "Add Article"}</button>
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => setPreview(!preview)}
                        >{preview ? "Preview Off" : "Preview On"}</button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}