import { useSession } from "next-auth/react";

import { type NextPage } from "next";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import NotSignedIn from "@components/error/NotSignedIn";
import RequestBrowser from "@components/request/Browser";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

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