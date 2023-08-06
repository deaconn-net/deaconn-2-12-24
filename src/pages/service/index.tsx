import { type NextPage } from "next";

import { type CategoryWithAllAndServiceCount } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import CategoryTabs from "@components/category/tabs";

import ServiceBrowser from "@components/service/browser";

const Page: NextPage<{
    categories?: CategoryWithAllAndServiceCount[]
}> = ({
    categories
}) => {
    return (
        <>
            <Meta
                title="Services - Deaconn"
                description="Find services offered by Deaconn ranging from bots to network firewalls!"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Services</h1>
                    <div className="flex flex-wrap gap-2">
                        {categories && (
                            <div>
                                <CategoryTabs
                                    categories_with_services={categories}
                                />
                            </div>
                        )}
                        <div className="grow p-6 flex flex-col gap-4">
                            <ServiceBrowser />
                        </div>
                    </div>
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

    return {
        props: {
            categories: categories
        }
    };
}

export default Page;