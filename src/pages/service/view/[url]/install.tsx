import { type GetServerSidePropsContext, type NextPage } from "next";

import { type ServiceWithCategoryAndLinks } from "~/types/service";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceView from "@components/service/View";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    service?: ServiceWithCategoryAndLinks,
} & GlobalPropsType> = ({
    service,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`${service?.name ?? "Not Found"} - Installation - Services - Deaconn`}
                description={`${service?.desc ?? "Service not found."}`}
                image={service?.banner ?? undefined}
                includeUploadUrl={service?.banner ? true : false}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Services",
                        url: "/service"
                    },
                    {
                        name: "Viewing"
                    },
                    ...(service ? [{
                        name: service.name,
                        url: `/service/view/${service.url}`
                    }] : []),
                    ...(service?.install ? [{
                        name: `Installation`,
                        url: `/service/view/${service.url}/install`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {service ? (
                        <ServiceView
                            service={service}
                            view="install"
                        />
                    ) : (
                        <NotFound item="Service" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve lookup URL.
    const { params } = ctx;

    const lookupUrl = params?.url?.toString();

    // Initialize service.
    let service: ServiceWithCategoryAndLinks | null = null;

    // Retrieve service if lookup URL is found.
    if (lookupUrl) {
        service = await prisma.service.findFirst({
            include: {
                category: true,
                links: true
            },
            where: {
                url: lookupUrl
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            service: JSON.parse(JSON.stringify(service))
        }
    };
}

export default Page;