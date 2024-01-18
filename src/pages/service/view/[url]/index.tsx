import { type GetServerSidePropsContext } from "next";

import { type ServiceWithCategoryAndLinks } from "~/types/service";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceView from "@components/service/View";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    service,

    footerServices,
    footerPartners
} : {
    service?: ServiceWithCategoryAndLinks
} & GlobalPropsType) {
    // Retrieve banner for Meta image.
    let banner = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE || undefined;

    if (service?.banner)
        banner = service.banner;

    return (
        <>
            <Meta
                title={`${service?.name ?? "Not Found"} - Services - Deaconn`}
                contentTitle={service?.name ?? "Not Found"}
                description={`${service?.desc ?? "Service not found."}`}
                image={banner}
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
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {service ? (
                        <ServiceView
                            service={service}
                            view="details"
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

    // Increment view.
    if (service) {
        await prisma.service.update({
            where: {
                id: service.id
            },
            data: {
                totalViews: {
                    increment: 1
                }
            }
        });
    } else {
        return {
            notFound: true
        }
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