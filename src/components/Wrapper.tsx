import React, { useContext, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type GlobalPropsType } from "@utils/GlobalProps";

import Header from "@components/Header";
import Footer from "@components/Footer";
import ErrorBox from "@components/error/Box";
import SuccessBox from "@components/success/Box";

export default function Wrapper ({
    footerServices,
    footerPartners,

    children
} : {
    children: React.ReactNode
} & GlobalPropsType) {
    // Retrieve session.
    const { data: session } = useSession();

    // Success and error messages.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const firstRender = useRef(true);
    
    // Reset error and success titles and messages on first render.
    // This ensures titles and messages don't persist between page loads.
    useEffect(() => {
        // If this isn't the first render, return.
        if (!firstRender.current)
            return;

        // If this is the first render, set to false and reset titles/messages.
        if (firstRender.current)
            firstRender.current = false;

        if (errorCtx) {
            errorCtx.setTitle(undefined);
            errorCtx.setMsg(undefined);
        }

        if (successCtx) {
            successCtx.setTitle(undefined);
            successCtx.setMsg(undefined);
        }
    }, [errorCtx, successCtx]);

    return (
        <main>
            <Header />
            <div className="content">
                {session?.user?.isRestricted ? (
                    <div className="content-item2">
                        <div>
                            <h1>Restricted!</h1>
                        </div>
                        <div>
                            <p>Your account has been restricted. Please contact an administrator.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ErrorBox
                            title={errorCtx?.title}
                            msg={errorCtx?.msg}
                        />
                        <SuccessBox
                            title={successCtx?.title}
                            msg={successCtx?.msg}
                        />

                        {children}
                    </>
                )}
            </div>
            <Footer
                services={footerServices}
                partners={footerPartners}
            />
        </main>
    );
}