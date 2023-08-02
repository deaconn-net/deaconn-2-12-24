import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Request } from "@prisma/client";

import Form from '@components/forms/request/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { prisma } from "@server/db";

const Page: NextPage<{
    request: Request | null
}> = ({
    request
}) => {
    return (
        <>
            <Meta
                title="New Request - Requests - Deaconn"
                description="Create a new request with Deaconn."
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Create Request</h1>
                    <Form
                        request={request ?? undefined}
                    />
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const lookup_id = ctx.query?.id;

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
            request: request
        }
    };
}

export default Page;