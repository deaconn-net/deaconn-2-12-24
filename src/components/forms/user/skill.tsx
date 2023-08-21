import React, { useContext, useEffect, useState } from "react";
import { Field, useFormik } from "formik";

import { type UserSkill } from "@prisma/client";
import { type UserSkillWithUser } from "~/types/user/skill";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from "@utils/scroll";

const Form: React.FC<{
    skill?: UserSkill | UserSkillWithUser
}> = ({
    skill
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Request mutations.
    const skillMut = api.user.addSkill.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (skillMut.isSuccess && success) {    
            success.setTitle(`Successfully ${skill ? "Saved" : "Created"} Skill!`);
            success.setMsg(`Your skill was ${skill ? "saved" : "created"} successfully!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (skillMut.isError && error) {
            console.error(skillMut.error.message);

            error.setTitle(`Error ${skill ? "Saving" : "Creating"} Skill`);
            error.setMsg(`Error ${skill ? "saving" : "creating"} skill. Read developer console for more information.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [skillMut, success, error, skill])

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{skill ? "Save" : "Add"} Skill</button>
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
            title: skill?.title ?? "",
            desc: skill?.desc ?? "",
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

            skillMut.mutate({
                id: skill?.id,
                title: values.title,
                desc: values.desc
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
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
                <label className="form-label">Details</label>
                {preview ? (
                    <p className="italic">{form.values.desc}</p>
                ) : (
                    <Field
                        name="desc"
                        className="form-input"
                        as="textarea"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
        </FormMain>
    );
}

export default Form;