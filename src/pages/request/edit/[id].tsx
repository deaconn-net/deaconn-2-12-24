import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Service, type Request } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import RequestForm from "@components/forms/request/new";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import { has_role } from "@utils/user/auth";

const Page: NextPage<{
    authed: boolean,
    request?: Request,
    services?: Service[]
} & GlobalPropsType> = ({
    authed,
    request,
    services,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Request ${request ? `#${request.id.toString()}` : `N/A`} - Requests - Deaconn`}
                description="Edit a request with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && request) ? (
                    <div className="content-item">
                        <h1>Edit Request</h1>
                        <RequestForm
                            request={request}
                            services={services}
                        />
                    </div>
                ) : (
                    <div className="content-item">
                        {request ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Request" />
                        )}
                    </div>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getSession(ctx);

    // Make sure we're signed in.
    let authed = false;

    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        authed = true;

    const lookup_id = params?.id;

    let request: Request | null = null;
    let services: Service[] | null = null;

    if (lookup_id) {
        request = await prisma.request.findFirst({
            where: {
                id: Number(lookup_id.toString())
            }
        });

        if (!authed && session?.user && request && session.user.id == request.userId)
            authed = true;
    }

    if (authed)
        services = await prisma.service.findMany();

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            request: JSON.parse(JSON.stringify(request)),
            services: JSON.parse(JSON.stringify(services))
        }
    };
}

export default Page;