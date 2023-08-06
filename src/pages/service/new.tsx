import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Service } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import Form from '@components/forms/service/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { prisma } from "@server/db";

const Page: NextPage<{
    service: Service | null,
    categories: CategoryWithChildren[]
}> = ({
    service,
    categories
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
                        categories={categories}
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
    let categories: CategoryWithChildren[] = [];

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

    categories = await prisma.category.findMany({
        where: {
            parent: null
        },
        include: {
            children: true
        }
    });

    return {
        props: {
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    };
}

export default Page;