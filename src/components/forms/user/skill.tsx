import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

import "react-datepicker/dist/react-datepicker.css";

export const UserSkillForm: React.FC<{ lookupId?: number }> = ({ lookupId }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve skill if any.
    const query = api.user.getSkill.useQuery({
        id: lookupId ?? 0
    });
    const skill = query.data;

    let isEdit = false;

    if (skill)
        isEdit = true;

    // Request mutations.
    const skillMut = api.user.addSkill.useMutation();

    // Check for errors or successes.
    if (skillMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Skill Added!");
        setSucMsg("Your skill was added or saved successfully!");
        
        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    if (skillMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Adding Or Saving Skill");
        setErrMsg("Error adding or editing skill. Read developer console for more information.");

        console.error(skillMut.error.message);

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    // Default values.
    const [retrievedVals, setRetrievedVals] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    if (skill && !retrievedVals) {
        setTitle(skill.title)
        if (skill.desc)
            setDesc(skill.desc);

        setRetrievedVals(true);
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            title: title,
            desc: desc,
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            skillMut.mutate({
                id: skill?.id ?? null,
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
                content={<Fields 
                    form={form}
                    preview={preview}
                />}
                submitBtn={<Button
                    isEdit={isEdit}
                    preview={preview}
                    setPreview={setPreview}
                />}
            />
        </>
    );
}

const Fields: React.FC<{ preview: boolean, form: any }> = ({ preview, form }) => {
    return (
        <>
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
        </>
    )
}

const Button: React.FC<{ preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>>, isEdit: boolean }> = ({ preview, setPreview, isEdit }) => {
    return (
        <div className="text-center">
            <button type="submit" className="button">{isEdit ? "Save" : "Add"} Skill</button>
            <button onClick={(e) => {
                e.preventDefault();

                if (preview)
                    setPreview(false);
                else
                    setPreview(true);
            }} className="ml-4 p-6 text-white text-center bg-cyan-800 rounded">{preview ? "Preview Off" : "Preview On"}</button>
        </div>
    )
}