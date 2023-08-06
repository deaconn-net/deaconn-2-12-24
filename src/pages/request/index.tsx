import { useSession } from "next-auth/react";

import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import NotSignedIn from "@components/errors/not_signed_in";

import RequestBrowser from "@components/request/browser";

const Page: NextPage = () => {
    // Session
    const { data: session } = useSession();

    return (
        <>
            <Meta
                title="Requests - Deaconn"
                description="View all requests with Deaconn."
            />
            <Wrapper>
                {session?.user ? (
                    <div className="content-item">
                        <h1>My Requests</h1>
                        <RequestBrowser />
                    </div>
                ) : (
                    <NotSignedIn />
                )}
            </Wrapper>
        </>
    );
}

export default Page;