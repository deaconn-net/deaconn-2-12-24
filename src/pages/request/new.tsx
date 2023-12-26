import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Service } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import RequestForm from "@components/forms/request/New";
import NoPermissions from "@components/error/NoPermissions";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    services,

    footerServices,
    footerPartners
} : {
    services?: Service[]
} & GlobalPropsType) {
    // Retrieve user session.
    const { data: session } = useSession();

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
                {session?.user ? (
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

    let services: Service[] | null = null;

    if (session?.user)
        services = await prisma.service.findMany();

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            services: JSON.parse(JSON.stringify(services))
        }
    };
}