import React from "react";

import { FormikProvider } from "formik";

export default function MainForm ({
    form,
    children,
    submitBtn,
    type="POST"
} : {
    form: any,
    children: React.ReactNode,
    submitBtn: JSX.Element,
    type?: string
}) {
    return (
        <FormikProvider value={form}>
            <form method={type} onSubmit={form.handleSubmit}>
                {children}
                {submitBtn}
            </form>
        </FormikProvider>
    );
}