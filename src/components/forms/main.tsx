import React from "react";

import { FormikProvider } from "formik";

const Main: React.FC<{
    form: any,
    children: React.ReactNode,
    submitBtn: JSX.Element,
    type?: string
}> = ({
    form,
    children,
    submitBtn,
    type="POST"
}) => {
    return (
        <FormikProvider value={form}>
            <form method={type} onSubmit={form.handleSubmit}>
                {children}
                {submitBtn}
            </form>
        </FormikProvider>
    );
}

export default Main;