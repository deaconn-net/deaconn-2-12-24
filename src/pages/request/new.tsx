import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

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
                {authed ? (
                    <div className="content-item2">
                        <div>
                            <h2>New Request</h2>
                        </div>
                        <div>
                            <RequestForm
                                services={services}
                            />
                        </div>
                    </div>
                ) : (
                    <NoPermissions />
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

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