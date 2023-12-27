import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type GlobalPropsType } from "@utils/GlobalProps";

import Header from "@components/Header";
import Footer from "@components/Footer";
import ErrorBox from "@components/error/Box";
import SuccessBox from "@components/success/Box";
import Breadcrumbs, { type Breadcrumb } from "./Breadcrumbs";
import GoogleAnalytics from "./GoogleAnalytics";

export const ViewPortCtx = createContext({
    mobile: false,
    innerHeight: 0,
    innerWidth: 0,
    scrollY: 0,
    scrollX: 0
})

export default function Wrapper ({
    footerServices,
    footerPartners,

    breadcrumbs,

    children
} : {
    breadcrumbs?: Breadcrumb[] | Breadcrumb
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

    const [viewPort, setViewPort] = useState({
        mobile: false,
        innerWidth: 0,
        innerHeight: 0,
        scrollY: 0,
        scrollX: 0
    });

    useEffect(() => {
        const checkViewPort = () => {
            if (typeof window !== undefined) {
                const innerHeight = window.innerHeight;
                const innerWidth = window.innerWidth;

                const scrollY = window.scrollY;
                const scrollX = window.scrollX;

                setViewPort({
                    mobile: innerWidth <= 639,
                    innerHeight: innerHeight,
                    innerWidth: innerWidth,
                    scrollY: scrollY,
                    scrollX: scrollX
                })
            }
        }

        if (typeof window !== undefined) {
            window.addEventListener("scroll", checkViewPort);
            window.addEventListener("resize", checkViewPort);
        }

        // Check view port now.
        checkViewPort();

        return () => {
            if (typeof window !== undefined) {
                window.removeEventListener("scroll", checkViewPort);
                window.removeEventListener("resize", checkViewPort);
            }
        }
    }, [])

    return (
        <main className="text-gray-100 min-h-screen bg-gradient-to-b from-zinc-900 to-neutral-900 flex flex-col break-words">
            <ViewPortCtx.Provider value={viewPort}>
                <GoogleAnalytics />
                <Header />
                <div className={`content ${(viewPort.scrollY == 0 && firstRender.current) ? "sm:animate-content-slide-up" : ""}`}>
                    {breadcrumbs && (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    )}
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
                    {breadcrumbs && (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    )}
                </div>
                <Footer
                    services={footerServices}
                    partners={footerPartners}
                />
            </ViewPortCtx.Provider>
        </main>
    );
}