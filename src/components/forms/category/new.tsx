import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Category } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import Markdown from "@components/markdown/markdown";

const CategoryForm: React.FC<{
    category?: Category,
    categories: CategoryWithChildren[]
}> = ({
    category,
    categories = []
}) => {
    // Success and error handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Role mutations.
    const categoryMut = api.category.add.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (categoryMut.isError && errorCtx) {    
            console.error(categoryMut.error.message);
    
            errorCtx.setTitle(`Error ${category ? "Saving" : "Creating"} Role`);
    
            if (categoryMut.error.data?.code == "UNAUTHORIZED")
                errorCtx.setMsg("You are not signed in or have permissions to create categories.")
            else
                errorCtx.setMsg(`Error ${category ? "saving" : "creating"} category.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    
        if (categoryMut.isSuccess && successCtx) {    
            successCtx.setTitle(`Successfully ${category ? "Saved" : "Created"} Category!`);
            successCtx.setMsg(`Category successfully ${category ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [category, categoryMut, errorCtx, successCtx])

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{category ? "Save Category" : "Add Category"}</button>
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
            parent: category?.parentId ?? 0,
            url: category?.url ?? "",
            name: category?.name ?? "",
            description: category?.desc ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

            // Create category.
            categoryMut.mutate({
                id: category?.id,
                parent: Number(values.parent) || null,
                url: values.url,
                name: values.name,
                description: values.description
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Parent</label>
                {preview ? (
                    <p className="italic">{form.values.parent}</p>
                ) : (
                    <select
                        name="parent"
                        className="form-input"
                        value={form.values.parent}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                    >
                        <option value="0">None</option>
                        {categories.map((parent) => {
                            return (
                                <React.Fragment key={`parent-category-${parent.id.toString()}`}>
                                    <option value={parent.id}>{parent.name}</option>

                                    {parent.children.map((parentChild) => {
                                        return (
                                            <option
                                                key={`parent-category-${parentChild.id.toString()}`}
                                                value={parentChild.id}
                                            >&nbsp;&nbsp;&nbsp;&nbsp;{"->"} {parentChild.name}</option>
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
                <label className="form-label">Description</label>
                {preview ? (
                    <Markdown>
                        {form.values.description}
                    </Markdown>
                ) : (
                    <Field
                        name="description"
                        as="textarea"
                        className="form-input"
                        rows={16}
                        cols={32}
                    />
                )}
            </div>
        </FormMain>
    );
}

export default CategoryForm;