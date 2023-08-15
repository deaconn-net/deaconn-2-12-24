import { type NextPage } from "next";

import { type CategoryWithAllAndServiceCount } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import CategoryTabs from "@components/category/tabs";
import ServiceBrowser from "@components/service/browser";
import TabMenuWithData from "@components/tabs/tab_menu_with_data";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    categories?: CategoryWithAllAndServiceCount[]
} & GlobalPropsType> = ({
    categories,

    footerServices,
    footerPartners
}) => {
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

export default Page;