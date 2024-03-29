import { Field, Form, Formik } from "formik";
import React, { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Category } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import Markdown from "@components/markdown/Markdown";

export default function CategoryForm ({
    category,
    categories = []
} : {
    category?: Category,
    categories: CategoryWithChildren[]
}) {
    // Success and error handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Role mutations.
    const categoryMut = api.category.add.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${category ? "Saving" : "Creating"} Category`);

                if (data?.code == "UNAUTHORIZED")
                    errorCtx.setMsg("You are not signed in or have permissions to create categories.")
                else
                    errorCtx.setMsg(`Error ${category ? "saving" : "creating"} category.`);

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${category ? "Saved" : "Created"} Category!`);
                successCtx.setMsg(`Category successfully ${category ? "saved" : "created"}!`);
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup preview.
    const [preview, setPreview] = useState(false);

    return (
        <Formik
            initialValues={{
                parent: category?.parentId ?? 0,
                url: category?.url ?? "",
                name: category?.name ?? "",
                description: category?.desc ?? ""
            }}
            onSubmit={(values) => {
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
            }}
        >
            {(form) => (
                <Form>
                    <div>
                        <label>Parent</label>
                        {preview ? (
                            <p className="italic">{form.values.parent}</p>
                        ) : (
                            <select
                                name="parent"
                                
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
                    <div>
                        <label>URL</label>
                        {preview ? (
                            <p className="italic">{form.values.url}</p>
                        ) : (
                            <Field
                                name="url"
                                
                            />
                        )}
                    </div>
                    <div>
                        <label>Name</label>
                        {preview ? (
                            <p className="italic">{form.values.name}</p>
                        ) : (
                            <Field
                                name="name"
                                
                            />
                        )}
                    </div>
                    <div>
                        <label>Description</label>
                        {preview ? (
                            <Markdown className="p-4">
                                {form.values.description}
                            </Markdown>
                        ) : (
                            <Field
                                name="description"
                                as="textarea"
                                
                                rows={16}
                                cols={32}
                            />
                        )}
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="submit"
                            className="button button-primary"
                        >{category ? "Save Category" : "Add Category"}</button>
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