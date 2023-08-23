import React, { useContext, useEffect } from "react";

import { type GlobalPropsType } from "@utils/global_props";

import Header from "@components/header";
import Footer from "@components/footer";
import ErrorBox from "@components/error/box";
import SuccessBox from "@components/success/box";
import { ErrorCtx, SuccessCtx } from "@pages/_app";

const Wrapper: React.FC<{
    children: React.ReactNode,
} & GlobalPropsType> = ({
    footerServices,
    footerPartners,

    children
}) => {
    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Reset error and success titles and messages every time this wrapper is remounted.
    useEffect(() => {
        if (errorCtx) {
            errorCtx.setTitle(undefined);
            errorCtx.setMsg(undefined);
        }

        if (successCtx) {
            successCtx.setTitle(undefined);
            successCtx.setMsg(undefined);
        }
    }, []);

    return (
        <main>
            <Header />
            <div className="content">
                <ErrorBox
                    title={errorCtx?.title}
                    msg={errorCtx?.msg}
                />
                <SuccessBox
                    title={successCtx?.title}
                    msg={successCtx?.msg}
                />

                {children}
            </div>
            <Footer
                services={footerServices}
                partners={footerPartners}
            />
        </main>
    );
}

export default Wrapper;