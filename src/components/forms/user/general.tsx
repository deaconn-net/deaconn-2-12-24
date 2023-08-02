import React, { useState } from "react";
import { Field, useFormik } from "formik";

import { type User } from "@prisma/client";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from "@utils/scroll";

import ReactMarkdown from "react-markdown";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const Form: React.FC<{
    user?: User
}> = ({
    user
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // User mutations.
    const userMut = api.user.update.useMutation();

    // Check for errors or successes.
    if (userMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Profile Saved!");
        setSucMsg("Your profile information was save successfully!");

        // Scroll to top.
        ScrollToTop();
    }

    if (userMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Saving Profile");
        setErrMsg("Error creating or editing request. Read developer console for more information.");

        console.error(userMut.error.message);

        // Scroll to top.
        ScrollToTop();
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >Save Profile</button>
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
            name: user?.name ?? "",
            url: user?.url ?? "",
            aboutMe: user?.aboutMe ?? "",
            birthday: new Date(user?.birthday ?? Date.now()),
            showEmail: user?.showEmail ?? false,

            website: user?.website ?? "",
            socialTwitter: user?.socialTwitter ?? "",
            socialGithub: user?.socialGithub,
            socialLinkedin: user?.socialLinkedin,
            socialFacebook: user?.socialFacebook
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            if (!user?.id) {
                setErrTitle("User Not Found!");
                setErrMsg("User not found when saving profile information.");

                return;
            }

            userMut.mutate({
                id: user.id,

                name: values.name,
                url: values.url,
                aboutMe: values.aboutMe,
                birthday: values.birthday,
                showEmail: values.showEmail,

                website: values.website || undefined,
                socialTwitter: values.socialTwitter || undefined,
                socialGithub: values.socialGithub || undefined,
                socialLinkedin: values.socialLinkedin || undefined,
                socialFacebook: values.socialFacebook || undefined
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
                <div className="form-div">
                    <label className="form-label">About Me</label>
                    {preview ? (
                        <ReactMarkdown className="markdown p-4 bg-gray-800">
                            {form.values.aboutMe}
                        </ReactMarkdown>
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
                        <>
                            <Field
                                name="showEmail"
                                type="checkbox"
                            /> <span>Yes</span>
                        </>
                    )}
                </div>
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
            </FormMain>
        </>
    );
}

export default Form;