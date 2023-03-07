import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { api } from '../../../utils/api';
import { FormMain } from '../main';

import ReactMarkdown from 'react-markdown';
import { ErrorBox } from '~/components/utils/error';
import { SuccessBox } from '~/components/utils/success';

import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";

export const RequestForm: React.FC<{ lookupId?: number | null }> = ({ lookupId }) => {
    // Success and error messages.
    const [errTitle, setErrTitle] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [sucTitle, setSucTitle] = useState<string | null>(null);
    const [sucMsg, setSucMsg] = useState<string | null>(null);

    // Retrieve request if any.
    const query = api.request.get.useQuery({
        id: lookupId ?? null
    });
    const request = query.data;

    // Request mutations.
    const requestMut = api.request.add.useMutation();

    // Check for errors or successes.
    if (requestMut.isSuccess && !sucTitle) {
        if (errTitle)
            setErrTitle(null);

        setSucTitle("Successfully " + (Boolean(request?.id) ? "Saved" : "Created") + "!");
        setSucMsg("Request successfully " + (Boolean(request?.id) ? "saved" : "created") + "!");
        
        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({ 
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });
        }
    }

    if (requestMut.isError && !errTitle) {
        if (sucTitle)
            setSucTitle(null);

        setErrTitle("Error Creating Or Editing Request");

        console.error(requestMut.error.message);
        if (requestMut.error.data?.code == "UNAUTHORIZED")
            setErrMsg("You are not signed in or have permissions to create requests.") 
        else
            setErrMsg("Error creating or editing request.");

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
    const [service, setService] = useState(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [timeframe, setTimeframe] = useState<number>(0);
    const [price, setPrice] = useState(50.00);
    const [content, setContent] = useState("");

    if (request && !retrievedVals) {
        setService(request?.service?.id ?? 0);
        setStartDate(request.startDate);
        setTimeframe(request.timeframe);
        setPrice(request.price);
        setContent(request.content);

        setRetrievedVals(true);
    }

    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Setup form.
    const form = useFormik({
        initialValues: {
            service: service,
            startDate: startDate,
            timeframe: timeframe,
            price: price,
            content: content
        },
        enableReinitialize: true,

        onSubmit: async (values) => {
            // Reset error and success.
            setErrTitle(null);
            setSucTitle(null);

            requestMut.mutate({
                id: request?.id ?? null,
                userId: null,
                serviceId: values.service,
                startDate: values.startDate,
                timeframe: values.timeframe,
                price: values.price,
                content: values.content            
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
                    isEdit={Boolean(request?.id)}
                />}
            />
        </>
    );
}

const Fields: React.FC<{ preview: boolean, form: any }> = ({ preview, form }) => {
    const query = api.service.getAll.useQuery({
        limit: 1000
    });

    const services = query?.data?.items;

    return (
        <>
            <div className="form-div">
                <label className="form-label">Service</label>
                {preview ? (
                    <p className="text-white italic">{form.values.service}</p>
                ) : (
                    <Field
                        as="select"
                        name="service"
                        className="form-input"
                    >
                        <>
                            <option value="0">None</option>
                            {services?.map((service) => {
                                return (
                                    <option value={service.id}>{service.name}</option>
                                )
                            })}     
                        </>
                    </Field>
                )}
                
            </div>
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
                <label className="form-label">Timeframe</label>
                {preview ? (
                    <p className="text-white italic">{form.values.timeframe}</p>
                ) : (
                    <Field name="timeframe" className="form-input" />
                )}
                <p className="text-sm text-gray-100 pt-1">Value should be in <span className="font-bold">hours</span>!</p>
            </div>
            <div className="form-div">
                <label className="form-label">Price</label>
                {preview ? (
                    <p className="text-white">{form.values.price}</p>
                ) : (
                    <Field name="price" className="form-input" />
                )}
            </div>
            <div className="form-div">
                <label className="form-label">Details</label>
                {preview ? (
                    <ReactMarkdown className="markdown text-white">{form.values.content}</ReactMarkdown>
                ) : (
                    <Field as="textarea" rows="16" cols="32" name="content" className="form-input" />
                )}
            </div>
        </>
    )
}

const Button: React.FC<{ isEdit?: boolean, preview: boolean, setPreview: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isEdit=false, preview, setPreview }) => {
    return (
        <div className="text-center">
            <button type="submit" className="p-6 text-white text-center bg-cyan-900 rounded">{isEdit ? "Save Request" : "Add Request"}</button>
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