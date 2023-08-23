import { Field, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import FormMain from "@components/forms/main";

import { api } from "@utils/api";
import { ScrollToTop } from '@utils/scroll';

import { type RequestReply } from "@prisma/client";

import Markdown from "@components/markdown/markdown";

const RequestReplyForm: React.FC<{
    requestId: number,
    reply?: RequestReply,
}> = ({
    requestId,
    reply
}) => {
    // Error and success handling
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Request mutations.
    const requestReplyMut = api.request.addReply.useMutation();

    // Check for errors or successes.
    useEffect(() => {
        if (requestReplyMut.isError && errorCtx) {
            console.error(requestReplyMut.error.message);
    
            errorCtx.setTitle("Error Creating Or Editing Reply");
    
            if (requestReplyMut.error.data?.code == "UNAUTHORIZED")
                errorCtx.setMsg("You are not signed in or have permissions to create replies.")
            else
                errorCtx.setMsg(`Error ${reply ? "saving" : "creating"} reply.`);
    
            // Scroll to top.
            ScrollToTop();
        }
    
        if (requestReplyMut.isSuccess && successCtx) {    
            successCtx.setTitle(`Successfully ${reply ? "Saved" : "Created"} Reply!`);
            successCtx.setMsg(`Reply successfully ${reply ? "saved" : "created"}!`);
    
            // Scroll to top.
            ScrollToTop();
        }
    }, [reply, requestReplyMut, errorCtx, successCtx])


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
            if (errorCtx)
                errorCtx.setTitle(undefined);

            if (successCtx)
                successCtx.setTitle(undefined);

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