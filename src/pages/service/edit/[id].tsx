import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Service } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ServiceForm from '@components/forms/service/new';
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import NotFound from "@components/errors/not_found";

const Page: NextPage<{
    authed: boolean,
    service?: Service,
    categories: CategoryWithChildren[]
} & GlobalPropsType> = ({
    authed,
    service,
    categories,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Service ${service?.name ?? "N/A"} - Services - Deaconn`}
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && service) ? (
                    <div className="content-item">
                        <h1>Edit Service</h1>
                        <ServiceForm
                            service={service}
                            categories={categories}
                        />
                    </div>
                ) : (
                    <div className="content-item">
                        {service ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Service" />
                        )}
                    </div>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    // Retrieve lookup ID.
    const { params } = ctx;

    const lookupId = params?.id?.toString();

    // Initialize service and categories.
    let service: Service | null = null;
    let categories: CategoryWithChildren[] = [];

    // If lookup ID and authenticated, retrieve service and categories.
    if (authed && lookupId) {
        service = await prisma.service.findFirst({
            where: {
                id: Number(lookupId)
            }
        });

        categories = await prisma.category.findMany({
            where: {
                parent: null
            },
            include: {
                children: true
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    };
}

export default Page;