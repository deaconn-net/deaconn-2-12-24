import React from "react";

import { FormikProvider } from "formik";


export const FormMain: React.FC<{ form: any, content: JSX.Element, submitBtn: JSX.Element, type?: string }> = ({ form, content, submitBtn, type="POST" }) => {
    return (
        <FormikProvider value={form}>
            <form method={type} onSubmit={form.handleSubmit}>
                {content}
                {submitBtn}
            </form>
        </FormikProvider>
    );
}