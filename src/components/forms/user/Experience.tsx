import { Field, Form, Formik } from "formik";
import React, { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserExperience } from "@prisma/client";
import { type UserExperienceWithUser } from "~/types/user/experience";

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
                if (data?.zodError) {
                    const zodErr = data.zodError;

                    if ("company" in zodErr.fieldErrors) {
                        const err = zodErr.fieldErrors.company?.toString();

                        errorCtx.setTitle("Company Validation Error");
                        errorCtx.setMsg(err ?? "Company is either too short or too long.");
                    } else if ("title" in zodErr.fieldErrors) {
                        const err = zodErr.fieldErrors.title?.toString();

                        errorCtx.setTitle("Title Validation Error");
                        errorCtx.setMsg(err ?? "Title is either too short or too long.");
                    } else if ("desc" in zodErr.fieldErrors) {
                        const err = zodErr.fieldErrors.desc?.toString();

                        errorCtx.setTitle("Description Validation Error");
                        errorCtx.setMsg(err ?? "Description is either too short or too long.");
                    } else if ("details" in zodErr.fieldErrors) {
                        const err = zodErr.fieldErrors.details?.toString();

                        errorCtx.setTitle("Details Validation Error");
                        errorCtx.setMsg(err ?? "Details is too long.");
                    }
                } else {
                    switch (data?.code) {
                        case "PAYLOAD_TOO_LARGE":
                            errorCtx.setTitle("Too Many Experiences!");
                            errorCtx.setMsg("You have too many existing experiences. Please delete one!");

                            break;

                        default:
                            errorCtx.setTitle(`Error ${experience ? "Saving" : "Creating"} Experience`);
                            errorCtx.setMsg(`Error ${experience ? "saving" : "creating"} experience. Read developer console for more information.`);
                    }
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

    return (
        <Formik
            initialValues={{
                startDate: new Date(experience?.startDate ?? Date.now()),
                endDate: new Date(experience?.endDate ?? Date.now()),
                company: experience?.company ?? "",
                title: experience?.title ?? "",
                desc: experience?.desc ?? "",
                details: experience?.details ?? ""
            }}
            onSubmit={(values) => {
                // Reset error and success.
                if (errorCtx)
                    errorCtx.setTitle(undefined);

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
            }}
        >
            {(form) => (
                <Form>
                    <div>
                        <label>Start Date</label>
                        {preview ? (
                            <p className="italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                        ) : (
                            <DatePicker
                                name="startDate"
                                
                                selected={form.values.startDate}
                                dateFormat="yyyy/MM/dd"
                                onChange={(date: Date) => {
                                    void form.setFieldValue('startDate', date);
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <label>End Date</label>
                        {preview ? (
                            <p className="italic">{form.values.endDate?.toString() ?? "Not Set"}</p>
                        ) : (
                            <DatePicker
                                name="endDate"
                                
                                selected={form.values.endDate}
                                dateFormat="yyyy/MM/dd"
                                onChange={(date: Date) => {
                                    void form.setFieldValue('endDate', date);
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <label>Company</label>
                        {preview ? (
                            <p className="italic">{form.values.company}</p>
                        ) : (
                            <Field
                                name="company"
                                
                            />
                        )}
                    </div>
                    <div>
                        <label>Title</label>
                        {preview ? (
                            <p className="italic">{form.values.title}</p>
                        ) : (
                            <Field
                                name="title"
                                
                            />
                        )}
                    </div>
                    <div>
                        <label>Short Description</label>
                        {preview ? (
                            <p className="italic">{form.values.desc}</p>
                        ) : (
                            <Field
                                as="textarea"
                                name="desc"
                                
                                rows="16"
                                cols="32"
                            />
                        )}
                    </div>
                    <div>
                        <label>Details</label>
                        {preview ? (
                            <Markdown className="p-4">
                                {form.values.details}
                            </Markdown>
                        ) : (
                            <Field
                                as="textarea"
                                name="details"
                                
                                rows="16"
                                cols="32"
                            />
                        )}
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="submit"
                            className="button button-primary"
                        >{experience ? "Save" : "Add"} Experience</button>
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