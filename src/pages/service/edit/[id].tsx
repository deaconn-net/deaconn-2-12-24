import { type GetServerSidePropsContext, type NextPage } from "next";
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


const Page: NextPage<{
    authed: boolean,
    service?: ServiceWithCategoryAndLinks,
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
                        url: `/service/edit/${service.id.toString()}`
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
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

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
            authed: authed,
            service: JSON.parse(JSON.stringify(service, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories
        }
    };
}

export default Page;