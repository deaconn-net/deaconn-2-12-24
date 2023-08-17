import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import FormMain from "@components/forms/main";
import { ErrorCtx, SuccessCtx } from "@components/wrapper";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import { type RequestReply } from "@prisma/client";

import Markdown from "@components/markdown";

const RequestReplyForm: React.FC<{
    requestId: number,
    reply?: RequestReply,
}> = ({
    requestId,
    reply
}) => {
    // Success and error messages.
    const success = useContext(SuccessCtx);
    const error = useContext(ErrorCtx);

    // Request mutations.
    const requestReplyMut = api.request.addReply.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (requestReplyMut.isSuccess && success) {    
            success.setTitle(`Successfully ${reply ? "Saved" : "Created"} Reply!`);
            success.setMsg(`Reply successfully ${reply ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }

        if (requestReplyMut.isError && error) {
            console.error(requestReplyMut.error.message);

            error.setTitle("Error Creating Or Editing Reply");
    
            if (requestReplyMut.error.data?.code == "UNAUTHORIZED")
                error.setMsg("You are not signed in or have permissions to create replies.")
            else
                error.setMsg(`Error ${reply ? "saving" : "creating"} reply.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [requestReplyMut, success, error, reply])


    // Setup preview.
    const [preview, setPreview] = useState(false);

    // Submit button.
    const submit_btn = 
        <div className="flex gap-2 justify-center">
            <button
                type="submit"
                className="button button-primary"
            >{reply ? "Save Reply" : "Add Reply"}</button>
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
            content: reply?.content ?? ""
        },
        enableReinitialize: false,

        onSubmit: (values) => {
            // Reset error and success.
            if (success)
                success.setTitle(undefined);

            if (error)
                error.setTitle(undefined);

            requestReplyMut.mutate({
                id: reply?.id,
                requestId: requestId,
                content: values.content
            });
        }
    });

    return (
        <FormMain
            form={form}
            submitBtn={submit_btn}
        >
            <div className="form-div">
                <label className="form-label">Content</label>
                {preview ? (
                    <Markdown className="p-4 bg-gray-800">
                        {form.values.content}
                    </Markdown>
                ) : (
                    <Field
                        name="content"
                        as="textarea"
                        className="form-input"
                        rows="16"
                        cols="32"
                    />
                )}
            </div>
        </FormMain>
    );
}

export default RequestReplyForm;