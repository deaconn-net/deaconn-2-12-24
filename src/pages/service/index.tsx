import { type CategoryWithAllAndServiceCount } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import CategoryTabs from "@components/category/Tabs";
import ServiceBrowser from "@components/service/Browser";
import TabMenuWithData from "@components/tabs/MenuWithData";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    categories,

    footerServices,
    footerPartners
} : {
    categories?: CategoryWithAllAndServiceCount[]
} & GlobalPropsType) {
    return (
        <>
            <Meta
                title="Services - Deaconn"
                description="Find services offered by Deaconn ranging from bots to network firewalls!"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    <h1>Services</h1>
                    {categories && categories.length > 0 ? (
                        <TabMenuWithData
                            menu={
                                <>
                                    {categories && (
                                        <CategoryTabs
                                            categories_with_services={categories}
                                        />
                                    )}
                                </>
                            }
                            data={
                                <ServiceBrowser />
                            }
                        />
                    ) : (
                        <ServiceBrowser />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    const categories = await prisma.category.findMany({
        where: {
            parent: null
        },
        include: {
            children: {
                include: {
                    _count: {
                        select: {
                            Service: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    Service: true
                }
            }
        }
    });

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            categories: categories
        }
    };
}