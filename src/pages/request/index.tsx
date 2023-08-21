import { useSession } from "next-auth/react";

import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import NotSignedIn from "@components/error/not_signed_in";
import RequestBrowser from "@components/request/browser";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    // Retrieve session.
    const { data: session } = useSession();

    return (
        <>
            <Meta
                title="Requests - Deaconn"
                description="View all requests with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
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

export async function getServerSideProps() {
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps
        }
    }
}

export default Page;