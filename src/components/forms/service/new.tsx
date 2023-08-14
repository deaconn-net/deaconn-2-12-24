import React, { useContext, useEffect, useState } from "react";
import { Field, useFormik } from "formik";

import { type Service } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import Markdown from "@components/markdown";

const Form: React.FC<{
    service?: Service,
    categories: CategoryWithChildren[]
}> = ({
    service,
    categories
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Service mutations.
    const serviceMut = api.service.add.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (serviceMut.isSuccess && success) {
            success.setTitle(`Successfully ${service ? "Saved" : "Created"} Service!`);
            success.setMsg(`Service successfully ${service ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }
        if (serviceMut.isError && error) {
            const errMsg = serviceMut.error.message;

            console.error(errMsg);

            error.setTitle(`Error ${service ? "Saving" : "Creating"} Service!`);
            
            if (serviceMut.error.data?.code == "UNAUTHORIZED")
                error.setMsg("You are not signed in or have permissions to create services.")
            else
                error.setMsg(`Error ${service ? "saving" : "creating"} service.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [serviceMut, success, error, service])

    // Setup banner and icons.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{service ? "Save Service" : "Add Service"}</button>
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
            category: service?.categoryId ?? 0,
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
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

            serviceMut.mutate({
                id: service?.id,
                category: Number(values.category) || null,
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
                {service?.banner && (
                    <>
                        {preview ? (
                            <>
                                <label>Remove Banner</label>
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
                <label className="form-label">Icon</label>
                <input
                    name="icon"
                    type="file"
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
                {service?.icon && (
                    <>
                        {preview ? (
                            <>
                                <label>Remove Icon</label>
                                <p className="italic">{form.values.iconRemove ? "Yes" : "No"}</p>
                            </>
                        ) : (
                            <>
                                <Field
                                    name="iconRemove"
                                    type="checkbox"
                                /> <span>Remove Icon</span>
                            </>
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
                <label className="form-label">Price</label>
                {preview ? (
                    <p>{form.values.price}</p>
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
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.desc}
                    </Markdown>
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
                <label className="form-label">Installation</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.install}
                    </Markdown>
                ) : (
                    <Field
                        name="install"
                        as="textarea"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Features</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.features}
                    </Markdown>
                ) : (
                    <Field
                        name="features"
                        as="textarea"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
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
            <div className="form-div">
                <label className="form-label">Git Link</label>
                {preview ? (
                    <p className="italic">{form.values.gitLink}</p>
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
                    <p className="italic">{(form.values.openSource) ? "Yes" : "No"}</p>
                ) : (
                    <>
                        <Field
                            name="openSource"
                            type="checkbox"
                        /> <span>Yes</span>
                    </>
                )}
            </div>
        </FormMain>
    );
}

export default Form;