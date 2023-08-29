import React, { useContext, useState } from "react";
import { Field, useFormik } from "formik";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserSkill } from "@prisma/client";
import { type UserSkillWithUser } from "~/types/user/skill";

import FormMain from "@components/forms/Main";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

export default function SkillForm ({
    skill
} : {
    skill?: UserSkill | UserSkillWithUser
}) {
    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Request mutations.
    const skillMut = api.user.addSkill.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                switch (data?.code) {
                    case "PAYLOAD_TOO_LARGE":
                        errorCtx.setTitle("Too Many Skills!");
                        errorCtx.setMsg("You have too many existing skills. Please delete one!");

                        break;

                    default:
                        errorCtx.setTitle(`Error ${skill ? "Saving" : "Creating"} Skill`);
                        errorCtx.setMsg(`Error ${skill ? "saving" : "creating"} skill. Read developer console for more information.`);
                }

                // Scroll to top.
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${skill ? "Saved" : "Created"} Skill!`);
                successCtx.setMsg(`Your skill was ${skill ? "saved" : "created"} successfully!`);
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

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
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

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