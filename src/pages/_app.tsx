import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import React, { createContext, useEffect, useState } from "react";

type CodeType = {
    title?: string,
    msg?: string,
    setTitle: React.Dispatch<React.SetStateAction<string | undefined>>,
    setMsg: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const ErrorCtx = createContext<CodeType | undefined>(undefined);
export const SuccessCtx = createContext<CodeType | undefined>(undefined);

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [successTitle, setSuccessTitle] = useState<string | undefined>(undefined);
    const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);

    return (
        <SessionProvider session={session}>
            <ErrorCtx.Provider value={{
                title: errorTitle,
                msg: errorMsg,
                setTitle: setErrorTitle,
                setMsg: setErrorMsg
            }}>
                <SuccessCtx.Provider value={{
                    title: successTitle,
                    msg: successMsg,
                    setTitle: setSuccessTitle,
                    setMsg: setSuccessMsg
                }}>
                    <Component {...pageProps} />
                </SuccessCtx.Provider>
            </ErrorCtx.Provider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);