import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type ServiceWithCategoryAndLinks } from "~/types/service";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceForm from '@components/forms/service/New';
import NoPermissions from "@components/error/NoPermissions";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import NotFound from "@components/error/NotFound";
import { useSession } from "next-auth/react";


export default function Page ({
    service,
    categories,

    footerServices,
    footerPartners
} : {
    service?: ServiceWithCategoryAndLinks
    categories: CategoryWithChildren[]
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = has_role(session, "contributor") || has_role(session, "admin");

    return (
        <>
            <Meta
                title={`Editing Service ${service?.name ?? "N/A"} - Services - Deaconn`}
                robots="noindex"
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Services",
                        url: "/service"
                    },
                    {
                        name: "Editing"
                    },
                    ...(service ? [{
                        name: service.name,
                        url: `/service/view/${service.url}`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && service) ? (
                    <div className="content-item2">
                        <div>
                            <h2>Edit Service {service.name}</h2>
                        </div>
                        <div>
                            <ServiceForm
                                service={service}
                                categories={categories}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Service" />
                        )}
                    </>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we're authenticated.
    const authed = has_role(session, "contributor") || has_role(session, "admin")

    // Retrieve lookup ID.
    const { params } = ctx;

    const lookupId = params?.id?.toString();

    // Initialize service and categories.
    let service: ServiceWithCategoryAndLinks | null = null;
    let categories: CategoryWithChildren[] = [];

    // If lookup ID and authenticated, retrieve service and categories.
    if (authed && lookupId) {
        service = await prisma.service.findFirst({
            include: {
                category: true,
                links: true
            },
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
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    };
}