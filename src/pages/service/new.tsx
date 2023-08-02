import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Service } from "@prisma/client";

import Form from '@components/forms/service/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { prisma } from "@server/db";

const Page: NextPage<{
    service: Service | null
}> = ({
    service
}) => {
    return (
        <>
            <Meta
                title="New Service - Services - Deaconn"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Create Service</h1>
                    <Form
                        service={service ?? undefined}
                    />
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const lookup_id = ctx.query?.id;
    const lookup_url = ctx.query?.url;

    let service: Service | null = null;

    if (lookup_id || lookup_url) {
        service = await prisma.service.findFirst({
            where: {
                ...(lookup_id && {
                    id: Number(lookup_id.toString())
                }),
                ...(lookup_url && {
                    url: lookup_url.toString()
                })
            }
        });
    }

    return {
        props: {
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    };
}

export default Page;