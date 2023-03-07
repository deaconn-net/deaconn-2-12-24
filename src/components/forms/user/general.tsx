import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";

import { useSession } from 'next-auth/react';

export const UserGeneralForm: React.FC = () => {
    const { data: session } = useSession();

    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve request if any.
    const query = api.user.get.useQuery({
        id: session?.user.id ?? "INVALID"
    });
    const user = query.data;

    // Request mutations.
    const userMut = api.user.update.useMutation();

    // Check for errors or successes.
    if (userMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Profile Saved!");
        setSucMsg("Your profile information was save successfully!");
        
        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    if (userMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Saving Profile");
        setErrMsg("Error creating or editing request. Read developer console for more information.");

        console.error(userMut.error.message);

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
    const [name, setName] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [birthday, setBirthday] = useState<Date | null>(null);
    const [showEmail, setShowEmail] = useState(false);

    if (user && !retrievedVals) {
        if (user.name)
            setName(user.name);

        if (user.aboutMe)
            setAboutMe(user.aboutMe);
        
        if (user.birthday)
            setBirthday(user.birthday);
        
        setShowEmail(user.showEmail);

        setRetrievedVals(true);
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            name: name,
            aboutMe: aboutMe,
            birthday: birthday,
            showEmail: showEmail,
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            userMut.mutate({
                id: session?.user.id ?? "INVALID",
    
                name: values.name,
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
                content={<Fields 
                    form={form}
                    preview={preview}
                />}
                submitBtn={<Button
                    preview={preview}
                    setPreview={setPreview}
                />}
            />
        </>
    );
}

const Fields: React.FC<{ preview: boolean, form: any }> = ({ preview, form }) => {
    const query = api.service.getAll.useQuery({
        limit: 1000
    });

    const services = query.data;

    return (
        <>
            <div className="form-div">
                <label className="form-label">Name</label>
                {preview ? (
                    <p className="text-white italic">{form.values.name}</p>
                ) : (
                    <Field name="name" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">About Me</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.aboutMe}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="aboutMe" className="form-input" />
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
                        onChange={(date) => form.setFieldValue('birthday', date)}
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
        </>
    )
}

const Button: React.FC<{ preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>> }> = ({ preview, setPreview }) => {
    return (
        <div className="text-center">
            <button type="submit" className="button">Save Profile</button>
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