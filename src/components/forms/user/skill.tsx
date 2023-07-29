import React, { useState } from "react";
import { Field, useFormik } from "formik";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import FormMain from "@components/forms/main";

import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";
import { ScrollToTop } from "@utils/scroll";

import ReactMarkdown from "react-markdown";
import "react-datepicker/dist/react-datepicker.css";

const Form: React.FC<{
    skill?: UserSkill
}> = ({
    skill
}) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | undefined>(undefined);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    const [sucTitle, setSucTitle] = useState<string | undefined>(undefined);
    const [sucMsg, setSucMsg] = useState<string | undefined>(undefined);

    // Request mutations.
    const skillMut = api.user.addSkill.useMutation();

    // Check for errors or successes.
    if (skillMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(undefined);

        setSucTitle("Skill Added!");
        setSucMsg("Your skill was added or saved successfully!");

        // Scroll to top.
        ScrollToTop();
    }

    if (skillMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(undefined);

        setErrTitle("Error Adding Or Saving Skill");
        setErrMsg("Error adding or editing skill. Read developer console for more information.");

        console.error(skillMut.error.message);

        // Scroll to top.
        ScrollToTop();
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="text-center">
            <button type="submit" className="button">{skill ? "Save" : "Add"} Skill</button>
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
            title: skill?.title ?? "",
            desc: skill?.desc ?? "",
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(undefined);
            setSucTitle(undefined);

            skillMut.mutate({
                id: skill?.id,
                title: values.title,
                desc: values.desc
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
                    <label className="form-label">Title</label>
                    {preview ? (
                        <p className="text-white italic">{form.values.title}</p>
                    ) : (
                        <Field name="title" className="form-input" />
                    )}
                </div>
                <div className="form-div">
                    <label className="form-label">Details</label>
                    {preview ? (
                        <ReactMarkdown className="markdown text-white">{form.values.desc}</ReactMarkdown>
                    ) : (
                        <Field as="textarea" rows="16" cols="32" name="desc" className="form-input" />
                    )}
                </div>
            </FormMain>
        </>
    );
}

export default Form;