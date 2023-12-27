import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Service, type Request } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import RequestForm from "@components/forms/request/New";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { HasRole } from "@utils/user/Auth";
import { useSession } from "next-auth/react";

export default function Page ({
    request,
    services = [],

    footerServices,
    footerPartners
} : {
    request?: Request
    services?: Service[]
} & GlobalPropsType) {
    // Retrieve user session and check if user has access.
    const { data: session } = useSession();

    let authed = HasRole(session, "admin") || HasRole(session, "moderator");

    if (!authed && session?.user && request && session.user.id == request.userId)
        authed = true;

    return (
        <>
            <Meta
                title={`Editing Request ${request?.title ?? "N/A"} - Requests - Deaconn`}
                description="Edit a request with Deaconn."
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Requests",
                        url: "/request"
                    },
                    {
                        name: "Editing"
                    },
                    ...(request ? [{
                        name: request.title ?? `#${request.id.toString()}`,
                        url: `/request/edit/${request.id.toString()}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && request) ? (
                    <div className="content-item2">
                        <div>
                            <h2>Edit Request {request.title ?? `#${request.id.toString()}`}</h2>
                        </div>
                        <div>
                            <RequestForm
                                request={request}
                                services={services}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Request" />
                        )}
                    </>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getServerAuthSession(ctx);

    // Make sure we're signed in.
    let authed = HasRole(session, "admin") || HasRole(session, "moderator");

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
            ...(authed && {
                request: JSON.parse(JSON.stringify(request)),
                services: JSON.parse(JSON.stringify(services))
            })
        }
    };
}