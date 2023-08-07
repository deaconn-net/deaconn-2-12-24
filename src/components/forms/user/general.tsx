import React, { useContext, useEffect, useState } from "react";
import { Field, useFormik } from "formik";

import { type User } from "@prisma/client";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from "@utils/scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ReactMarkdown from "react-markdown";

const Form: React.FC<{
    user?: User
}> = ({
    user
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // User mutations.
    const userMut = api.user.update.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (userMut.isSuccess && success) {
            success.setTitle("Profile Saved!");
            success.setMsg("Your profile information was save successfully!");
    
            // Scroll to top.
            ScrollToTop();
        }
        if (userMut.isError && error) {
            console.error(userMut.error.message);

            error.setTitle("Error Saving Profile");
            error.setMsg("Error saving profile. Read developer console for more information.");
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [userMut, success, error, user])

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex flex-wrap gap-2 justify-center">
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
            if (success)
                success.setTitle(undefined);
            
            if (error)
                error.setTitle(undefined);

            if (!user?.id) {
                if (error) {
                    error.setTitle("User Not Found!");
                    error.setMsg("User not found when saving profile information.");
                }

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
    );
}

export default Form;