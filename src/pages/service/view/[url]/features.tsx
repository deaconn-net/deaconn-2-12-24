import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Service } from ".prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceView from "@components/service/View";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    service?: Service,
} & GlobalPropsType> = ({
    service,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`${service?.name ?? "Not Found"} - Features - Services - Deaconn`}
                description={`${service?.desc ?? "Service not found."}`}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Services",
                        url: "/service"
                    },
                    ...(service ? [{
                        name: `Viewing ${service.name}`,
                        url: `/service/view/${service.url}`
                    }] : []),
                    ...(service?.features ? [{
                        name: `Features`,
                        url: `/service/view/${service.url}/features`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {service ? (
                        <ServiceView
                            service={service}
                            view="features"
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
    let service: Service | null = null;

    // Retrieve service if lookup URL is found.
    if (lookupUrl) {
        service = await prisma.service.findFirst({
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