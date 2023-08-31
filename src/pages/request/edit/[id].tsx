import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Service, type Request } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import RequestForm from "@components/forms/request/New";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { has_role } from "@utils/user/Auth";

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
                <div className="content-item">
                    {(authed && request) ? (
                        <>
                            <h1>Edit Request</h1>
                            <RequestForm
                                request={request}
                                services={services}
                            />
                        </>
                    ) : (
                        <>
                            {!authed ? (
                                <NoPermissions />
                            ) : (
                                <NotFound item="Request" />
                            )}
                        </>
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getServerAuthSession(ctx);

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