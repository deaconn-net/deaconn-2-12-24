import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Service } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Form from '@components/forms/service/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";

const Page: NextPage<{
    authed: boolean,
    service?: Service,
    categories: CategoryWithChildren[]
}> = ({
    authed,
    service,
    categories
}) => {
    return (
        <>
            <Meta
                title="New Service - Services - Deaconn"
            />
            <Wrapper>
                {authed ? (
                    <div className="content-item">
                        <h1>{service ? "Save" : "Create"} Service</h1>
                        <Form
                            service={service}
                            categories={categories}
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

    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let service: Service | null = null;
    let categories: CategoryWithChildren[] = [];

    if (authed) {
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
    }

    return {
        props: {
            authed: authed,
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    };
}

export default Page;