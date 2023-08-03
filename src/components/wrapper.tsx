import React, { createContext, useState } from "react";

import Header from "@components/header";
import Footer from "@components/footer";
import ErrorBox from "@utils/error";
import SuccessBox from "@utils/success";

interface successInt {
    setTitle: React.Dispatch<React.SetStateAction<string | undefined>>
    setMsg: React.Dispatch<React.SetStateAction<string | undefined>>
}

interface errorInt {
    setTitle: React.Dispatch<React.SetStateAction<string | undefined>>
    setMsg: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const SuccessCtx = createContext<successInt | undefined>(undefined);
export const ErrorCtx = createContext<errorInt | undefined>(undefined);

const Wrapper: React.FC<{
    successTitleOverride?: string,
    successMsgOverride?: string
    errorTitleOverride?: string,
    errorMsgOverride?: string,

    children: React.ReactNode,
}> = ({
    successTitleOverride,
    successMsgOverride,
    errorTitleOverride,
    errorMsgOverride,

    children
}) => {
    // Success and error messages.
    const [successTitle, setSuccessTitle] = useState<string | undefined>(undefined);
    const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);

    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    // Overrides
    if (successTitleOverride && !successTitle)
        setSuccessTitle(successTitleOverride);

    if (successMsgOverride && !successMsg)
        setSuccessMsg(successMsgOverride);

    if (errorTitleOverride && !errorTitle)
        setErrorTitle(errorTitleOverride);

    if (errorMsgOverride && !errorMsg)
        setErrorMsg(errorMsgOverride);

    return (
        <SuccessCtx.Provider value={{
            setTitle: setSuccessTitle,
            setMsg: setSuccessMsg
        }}>
            <ErrorCtx.Provider value={{
                setTitle: setErrorTitle,
                setMsg: setErrorMsg
            }}>
                <main>
                    <Header />
                    <div className="content">
                        <SuccessBox
                            title={successTitle}
                            msg={successMsg}
                        />
                        <ErrorBox
                            title={errorTitle}
                            msg={errorMsg}
                        />
                        
                        {children}
                    </div>
                    <Footer />
                </main>
            </ErrorCtx.Provider>
        </SuccessCtx.Provider>
    );
}

export default Wrapper;