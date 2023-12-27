import { Field, Form, Formik } from "formik";
import React, { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import { type Partner } from "@prisma/client";
import Checkbox from "../Checkbox";
import Markdown from "@components/markdown/Markdown";

export default function PartnerForm ({
    partner
} : {
    partner?: Partner
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Partner mutations.
    const partnerMut = api.partner.add.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${partner ? "Saving" : "Creating"} Partner`);
    
                if (data?.code == "UNAUTHORIZED")
                    errorCtx.setMsg("You are not signed in or have permissions to create partners.")
                else
                    errorCtx.setMsg(`Error ${partner ? "saving" : "creating"} partner.`);

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${partner ? "Saved" : "Created"} Partner!`);
                successCtx.setMsg(`Partner successfully ${partner ? "saved" : "created"}!`);
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup banner and icon images.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(null);

    // Setup preview.
    const [preview, setPreview] = useState(false);

    return (
        <Formik
            initialValues={{
                priority: partner?.priority ?? 0,
                name: partner?.name ?? "",
                about: partner?.about ?? "",
                url: partner?.url ?? "",
                bannerRemove: false,
                iconRemove: false 
            }}
            onSubmit={(values) => {
                // Reset error and success.
                if (errorCtx)
                    errorCtx.setTitle(undefined);

                if (successCtx)
                    successCtx.setTitle(undefined);

                // Create article.
                partnerMut.mutate({
                    id: partner?.id,
                    priority: values.priority,
                    name: values.name,
                    about: values.about,
                    url: values.url,
                    banner: banner?.toString(),
                    bannerRemove: values.bannerRemove,
                    icon: icon?.toString(),
                    iconRemove: values.iconRemove
                });
            }}
        >
            {(form) => (
                <Form>
                    <div>
                        <label>Banner</label>
                        <input
                            name="banner"
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
                        {partner?.banner && (
                            <>
                                {preview ? (
                                    <>
                                        <label>Remove Banner</label>
                                        <p className="italic">{form.values.bannerRemove ? "Yes" : "No"}</p>
                                    </>
                                ) : (
                                    <Checkbox
                                        name="bannerRemove"
                                        text={<span>Remove Banner</span>}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        <label>Icon</label>
                        <input
                            name="icon"
                            type="file"
                            
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
                        {partner?.icon && (
                            <>
                                {preview ? (
                                    <>
                                        <label>Remove Icon</label>
                                        <p className="italic">{form.values.iconRemove ? "Yes" : "No"}</p>
                                    </>
                                ) : (
                                    <Checkbox
                                        name="iconRemove"
                                        text={<span>Remove Icon</span>}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        <label>Priority</label>
                        {preview ? (
                            <p className="italic">{form.values.priority.toString()}</p>
                        ) : (
                            <Field
                                type="number"
                                name="priority"
                                
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
                        <label>About</label>
                        {preview ? (
                            <Markdown>
                                {form.values.about}
                            </Markdown>
                        ) : (
                            <Field
                                name="about"
                                as="textarea"
                                
                                rows={8}
                                cols={32}
                            />
                        )}
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="submit"
                            className="button button-primary"
                        >{partner ? "Save Partner" : "Add Partner"}</button>
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