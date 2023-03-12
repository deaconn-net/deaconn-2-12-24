import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";

export const UserProjectForm: React.FC<{ lookupId?: number }> = ({ lookupId }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve project if any.
    const query = api.user.getProject.useQuery({
        id: lookupId ?? 0
    });
    const project = query.data;

    let isEdit = false;

    if (project)
        isEdit = true;

    // Request mutations.
    const projectMut = api.user.addProject.useMutation();

    // Check for errors or successes.
    if (projectMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Project Added!");
        setSucMsg("Your project was added or saved successfully!");

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
    }

    if (projectMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Adding Or Saving Project");
        setErrMsg("Error adding or editing project. Read developer console for more information.");

        console.error(projectMut.error.message);

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
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");

    if (project && !retrievedVals) {
        if (project.startDate)
            setStartDate(project.startDate);
        if (project.endDate)
            setEndDate(project.endDate);
        setName(project.name)
        if (project.desc)
            setDesc(project.desc);

        setRetrievedVals(true);
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            startDate: startDate,
            endDate: endDate,
            name: name,
            desc: desc,
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            projectMut.mutate({
                id: project?.id ?? null,
                startDate: values.startDate,
                endDate: values.endDate,
                name: values.name,
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
                <label className="form-label">Start Date</label>
                {preview ? (
                    <p className="text-white italic">{form.values.startDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        className="form-input"
                        name="startDate"
                        selected={form.values.startDate}
                        onChange={(date: Date) => form.setFieldValue('startDate', date)}
                        dateFormat="yyyy/MM/dd"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">End Date</label>
                {preview ? (
                    <p className="text-white italic">{form.values.endDate?.toString() ?? "Not Set"}</p>
                ) : (
                    <DatePicker
                        className="form-input"
                        name="endDate"
                        selected={form.values.endDate}
                        onChange={(date: Date) => form.setFieldValue('endDate', date)}
                        dateFormat="yyyy/MM/dd"
                    />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Name</label>
                {preview ? (
                    <p className="text-white italic">{form.values.name}</p>
                ) : (
                    <Field name="name" className="form-input" />
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
            <button type="submit" className="button">{isEdit ? "Save" : "Add"} Project</button>
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