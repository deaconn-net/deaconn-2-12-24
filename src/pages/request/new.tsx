import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Service } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import RequestForm from "@components/forms/request/New";
import NoPermissions from "@components/error/NoPermissions";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    authed: boolean,
    services?: Service[]
} & GlobalPropsType> = ({
    authed,
    services,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`New Request - Requests - Deaconn`}
                description="Create or edit a request with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {authed ? (
                        <>
                            <h1>New Request</h1>
                            <RequestForm
                                services={services}
                            />
                        </>
                    ) : (
                        <NoPermissions />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Make sure we're signed in.
    let authed = false;

    if (session)
        authed = true;

    let services: Service[] | null = null;

    if (authed)
        services = await prisma.service.findMany();

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            services: JSON.parse(JSON.stringify(services))
        }
    };
}

export default Page;