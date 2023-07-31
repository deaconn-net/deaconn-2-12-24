import React, { useState } from "react";

import { Field, useFormik } from "formik";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from "@utils/scroll";

import ReactMarkdown from "react-markdown";
import DatePicker from "react-datepicker";

import { User } from "@prisma/client";

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

    // Request mutations.
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
        <div className="text-center">
            <button type="submit" className="button">Save Profile</button>
            <button onClick={(e) => {
                e.preventDefault();

                if (preview)
                    setPreview(false);
                else
                    setPreview(true);
            }} className="ml-4 p-6 text-white text-center bg-cyan-800 rounded">{preview ? "Preview Off" : "Preview On"}</button>
        </div>;

    // Setup form.
    const form = useFormik({
        initialValues: {
            name: user?.name ?? "",
            url: user?.url ?? "",
            aboutMe: user?.aboutMe ?? "",
            birthday: new Date(user?.birthday ?? Date.now()),
            showEmail: user?.showEmail ?? false
        },
        enableReinitialize: false,

        onSubmit: async (values) => {
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
                showEmail: values.showEmail
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
                        <p className="text-white italic">{form.values.name}</p>
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
                        <p className="text-white italic">{form.values.url}</p>
                    ) : (
                        <Field 
                            name="url"
                            className="form-input"
                        />
                    )}
                    <p className="p-2 text-white text-sm">The URL to your profile (e.g. deaconn.net/user/view/<span className="font-bold">URL</span>)</p>
                </div>
                <div className="form-div">
                    <label className="form-label">About Me</label>
                    {preview ? (
                        <ReactMarkdown 
                            className="markdown text-white"
                        >
                            {form.values.aboutMe}
                        </ReactMarkdown>
                    ) : (
                        <Field
                            name="aboutMe"
                            className="form-input"
                            as="textarea"
                            rows="16"
                            cols="32"
                        />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Birthday</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.birthday?.toString() ?? "Not Set"}</p>
                    ) : (
                        <DatePicker
                            className="form-input"
                            name="birthday"
                            selected={form.values.birthday}
                            onChange={(date: Date) => form.setFieldValue('birthday', date)}
                            dateFormat="yyyy/MM/dd"
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
                            /> <span className="text-white">Yes</span>
                        </>
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;