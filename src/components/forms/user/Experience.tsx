import { Field, useFormik } from "formik";
import React, { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserExperience } from "@prisma/client";
import { type UserExperienceWithUser } from "~/types/user/experience";

import FormMain from "@components/forms/Main";

import { api } from "@utils/Api";
import { ScrollToTop } from "@utils/Scroll";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Markdown from "@components/markdown/Markdown";

export default function ExperienceForm ({
    experience,
} : {
    experience?: UserExperience | UserExperienceWithUser
}) {
    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Request mutations.
    const experienceMut = api.user.addExperience.useMutation({
        onError: (opts) => {
            const { message, data } = opts;

            console.error(message);

            if (errorCtx) {
                switch (data?.code) {
                    case "PAYLOAD_TOO_LARGE":
                        errorCtx.setTitle("Too Many Experiences!");
                        errorCtx.setMsg("You have too many existing experiences. Please delete one!");

                        break;

                    default:
                        errorCtx.setTitle(`Error ${experience ? "Saving" : "Creating"} Experience`);
                        errorCtx.setMsg(`Error ${experience ? "saving" : "creating"} experience. Read developer console for more information.`);
                }
        
                // Scroll to top.
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${experience ? "Saved" : "Created"} Experience!`);
                successCtx.setMsg(`Your experience was ${experience ? "saved" : "created"} successfully!`);
        
                // Scroll to top.
                ScrollToTop();
            }
        }
    });

    // Setup preview.
    const [preview, setPreview] = useState(false);

    const submit_btn =
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{experience ? "Save" : "Add"} Experience</button>
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
            startDate: new Date(experience?.startDate ?? Date.now()),
            endDate: new Date(experience?.endDate ?? Date.now()),
            company: experience?.company ?? "",
            title: experience?.title ?? "",
            desc: experience?.desc ?? "",
            details: experience?.details ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            if (errorCtx)
                errorCtx.setTitle(undefined);

            // Reset error and success.
            if (successCtx)
                successCtx.setTitle(undefined);

            experienceMut.mutate({
                id: experience?.id,
                startDate: values.startDate || null,
                endDate: values.endDate || null,
                company: values.company,
                title: values.title,
                desc: values.desc,
                details: values.details
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Start Date</label>
                {preview ? (
                    <p className="italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        name="startDate"
                        className="form-input"
                        selected={form.values.startDate}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date: Date) => {
                            void form.setFieldValue('startDate', date);
                        }}
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">End Date</label>
                {preview ? (
                    <p className="italic">{form.values.endDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        name="endDate"
                        className="form-input"
                        selected={form.values.endDate}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date: Date) => {
                            void form.setFieldValue('endDate', date);
                        }}
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Company</label>
                {preview ? (
                    <p className="italic">{form.values.company}</p>
                ) : (
                    <Field
                        name="company"
                        className="form-input"
                    />
                )}
            </div>
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
                <label className="form-label">Short Description</label>
                {preview ? (
                    <p className="italic">{form.values.desc}</p>
                ) : (
                    <Field
                        as="textarea"
                        name="desc"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.details}
                    </Markdown>
                ) : (
                    <Field
                        as="textarea"
                        name="details"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
        </FormMain>
    );
}