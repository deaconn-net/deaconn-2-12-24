import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Request } from "@prisma/client";

import { prisma } from "@server/db";

import Form from '@components/forms/request/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import NoPermissions from "@components/errors/no_permissions";

const Page: NextPage<{
    authed: boolean,
    request?: Request
}> = ({
    authed,
    request
}) => {
    return (
        <>
            <Meta
                title="New Request - Requests - Deaconn"
                description="Create a new request with Deaconn."
            />
            <Wrapper>
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

    return {
        props: {
            authed: authed,
            request: request
        }
    };
}

export default Page;