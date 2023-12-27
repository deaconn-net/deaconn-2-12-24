import React, { useContext, useState } from "react";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type User } from "@prisma/client";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Markdown from "@components/markdown/Markdown";
import { HasRole } from "@utils/user/Auth";
import Checkbox from "../Checkbox";

export default function GeneralForm ({
    user
} : {
    user?: User
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // User mutations.
    const userMut = api.user.update.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                if (data?.zodError) {
                    const zodErr = data.zodError;
                    
                    if ("url" in zodErr.fieldErrors) {
                        errorCtx.setTitle("Invalid URL");
                        errorCtx.setMsg("Invalid URL set. Please make sure to use letters, numbers, and hyphens (-) only.");
                    } else if ("name" in zodErr.fieldErrors) {
                        errorCtx.setTitle("Invalid Name");
                        errorCtx.setMsg("Invalid name. Please make sure to use letters, numbers, hyphens, and spaces only.");
                    }
                } else {
                    errorCtx.setTitle("Error Saving Profile");
                    errorCtx.setMsg("Error saving profile. Read developer console for more information.");
                }
        
                // Scroll to top.
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Profile Saved!");
                successCtx.setMsg("Your profile information was save successfully!");
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Avatar.
    const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);

    return (
        <Formik
            initialValues={{
                name: user?.name ?? "",
                url: user?.url ?? "",
                title: user?.title ?? "",
                aboutMe: user?.aboutMe ?? "",
                birthday: new Date(user?.birthday ?? Date.now()),
                showEmail: user?.showEmail ?? false,
                isTeam: user?.isTeam ?? false,
                isRestricted: user?.isRestricted ?? false,
    
                avatarRemove: false,
    
                website: user?.website ?? "",
                socialTwitter: user?.socialTwitter ?? "",
                socialGithub: user?.socialGithub ?? "",
                socialLinkedin: user?.socialLinkedin ?? "",
                socialFacebook: user?.socialFacebook ?? ""
            }}
            onSubmit={(values) => {
                // Reset error and success.
                if (errorCtx)
                    errorCtx.setTitle(undefined);

                if (successCtx)
                    successCtx.setTitle(undefined);

                if (!user?.id) {
                    if (errorCtx) {
                        errorCtx.setTitle("User Not Found!");
                        errorCtx.setMsg("User not found when saving profile information.");
                    }

                    return;
                }

                userMut.mutate({
                    id: user.id,

                    name: values.name || undefined,
                    url: values.url || undefined,
                    aboutMe: values.aboutMe,
                    birthday: values.birthday,
                    showEmail: values.showEmail,
                    isTeam: values.isTeam,
                    isRestricted: values.isRestricted,

                    ...(HasRole(session, "ADMIN") && {
                        title: values.title
                    }),

                    avatar: avatar?.toString(),
                    avatarRemove: values.avatarRemove,

                    website: values.website,
                    socialTwitter: values.socialTwitter,
                    socialGithub: values.socialGithub,
                    socialLinkedin: values.socialLinkedin,
                    socialFacebook: values.socialFacebook
                });
            }}
        >
            {(form) => (
                <Form>
                    <div className="form-div">
                        <label 
                            className="form-label"
                        >Avatar</label>
                        <input
                            name="avatar"
                            className="form-input"
                            type="file"
                            onChange={(e) => {
                                const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                                if (file) {
                                    const reader = new FileReader();

                                    reader.onloadend = () => {
                                        setAvatar(reader.result);
                                    };
                                    
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {user?.avatar && (
                            <>
                                {preview ? (
                                    <>
                                        <label className="form-label">Remove Avatar</label>
                                        <p className="italic">{form.values.avatarRemove ? "Yes" : "No"}</p>
                                    </>
                                ) : (
                                    <Checkbox
                                        name="avatarRemove"
                                        text={<span>Remove Avatar</span>}
                                    />
                                )}
                            </>
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
                        <label className="form-label">URL</label>
                        {preview ? (
                            <p className="italic">{form.values.url}</p>
                        ) : (
                            <Field 
                                name="url"
                                className="form-input"
                            />
                        )}
                        <p className="text-sm leading-8">The URL to your profile (e.g. deaconn.net/user/view/<span className="font-bold">URL</span>)</p>
                    </div>
                    {HasRole(session, "ADMIN") && (
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
                            <p className="text-sm leading-8">The user&apos;s title.</p>
                        </div>
                    )}
                    <div className="form-div">
                        <label className="form-label">About Me</label>
                        {preview ? (
                            <Markdown className="p-4">
                                {form.values.aboutMe}
                            </Markdown>
                        ) : (
                            <Field
                                name="aboutMe"
                                as="textarea"
                                className="form-input"
                                rows="16"
                                cols="32"
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Birthday</label>
                        {preview ? (
                            <p className="italic">{form.values.birthday?.toString() ?? "Not Set"}</p>
                        ) : (
                            <DatePicker
                                name="birthday"
                                className="form-input"
                                selected={form.values.birthday}
                                dateFormat="yyyy/MM/dd"
                                onChange={(date: Date) => {
                                    void form.setFieldValue('birthday', date);
                                }}
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Show Email</label>
                        {preview ? (
                            <p className="italic">{form.values.showEmail ? "Yes" : "No"}</p>
                        ) : (
                            <Checkbox
                                name="showEmail"
                                text={<span>Yes</span>}
                            />
                        )}
                    </div>
                    {HasRole(session, "ADMIN") && (
                        <>
                            <div className="form-div">
                                <label className="form-label">Is Team</label>
                                {preview ? (
                                    <p className="italic">{form.values.isTeam ? "Yes" : "No"}</p>
                                ) : (
                                    <Checkbox
                                        name="isTeam"
                                        text={<span>Yes</span>}
                                    />
                                )}
                            </div>
                            <div className="form-div">
                                <label className="form-label">Is Restricted</label>
                                {preview ? (
                                    <p className="italic">{form.values.isRestricted ? "Yes" : "No"}</p>
                                ) : (
                                    <Checkbox
                                        name="isRestricted"
                                        text={<span>Yes</span>}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    <h2>Social</h2>
                    <div className="form-div">
                        <label className="form-label">Website</label>
                        {preview ? (
                            <p className="italic">{form.values.website}</p>
                        ) : (
                            <Field
                                name="website"
                                className="form-input"
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Twitter</label>
                        {preview ? (
                            <p className="italic">{form.values.socialTwitter}</p>
                        ) : (
                            <Field
                                name="socialTwitter"
                                className="form-input"
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Github</label>
                        {preview ? (
                            <p className="italic">{form.values.socialGithub}</p>
                        ) : (
                            <Field
                                name="socialGithub"
                                className="form-input"
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Linkedin</label>
                        {preview ? (
                            <p className="italic">{form.values.socialLinkedin}</p>
                        ) : (
                            <Field
                                name="socialLinkedin"
                                className="form-input"
                            />
                        )}
                    </div>
                    <div className="form-div">
                        <label className="form-label">Facebook</label>
                        {preview ? (
                            <p className="italic">{form.values.socialFacebook}</p>
                        ) : (
                            <Field
                                name="socialFacebook"
                                className="form-input"
                            />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            type="submit"
                            className="button button-primary"
                        >Save Profile</button>
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