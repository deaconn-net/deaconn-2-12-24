import { GetServerSidePropsContext, NextPage } from "next";

import { type Request } from "@prisma/client";

import Form from '@components/forms/request/new';
import Wrapper from "@components/wrapper";

import { prisma } from "@server/db";

const Page: NextPage<{
    request: Request | null
}> = ({
    request
}) => {
    return (
        <Wrapper>
            <div className="content">
                <h1 className="text-3xl text-white font-bold italic">Create Request</h1>
                <Form
                    request={request}
                />
            </div>
        </Wrapper>
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