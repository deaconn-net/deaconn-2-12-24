import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Request } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import Form from '@components/forms/request/new';
import NoPermissions from "@components/errors/no_permissions";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    authed: boolean,
    request?: Request
} & GlobalPropsType> = ({
    authed,
    request,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="New Request - Requests - Deaconn"
                description="Create a new request with Deaconn."
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {authed ? (
                    <div className="content-item">
                        <h1>{request ? "Save" : "Create"} Request</h1>
                        <Form
                            request={request}
                        />
                    </div>
                ) : (
                    <NoPermissions />
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const session = await getSession(ctx);

    // Make sure we're signed in.
    let authed = false;

    if (session)
        authed = true;

    const lookup_id = query?.id;

    let request: Request | null = null;

    if (lookup_id) {
        request = await prisma.request.findFirst({
            where: {
                id: Number(lookup_id.toString())
            }
        });
    }

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            request: request
        }
    };
}

export default Page;