import { type GetServerSidePropsContext, type NextPage } from "next";

import { type CategoryWithAllAndServiceCount, type CategoryWithAll } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceBrowser from "@components/service/Browser";
import CategoryTabs from "@components/category/Tabs";
import TabMenuWithData from "@components/tabs/MenuWithData";
import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    category?: CategoryWithAll,
    categories?: number[],
    categoriesList?: CategoryWithAllAndServiceCount[]
} & GlobalPropsType> = ({
    category,
    categories,
    categoriesList,
    
    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`${category?.name ?? "Not Found"} - Services - Deaconn`}
                description={`${category?.desc ?? "Not found."}`}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Services",
                        url: "/service"
                    },
                    ...(category?.parent ? [{
                        name: `Category ${category.parent.name.charAt(0).toUpperCase()}${category.parent.name.slice(1)}`,
                        url: `/service/category/${category.parent.url}`
                    }] : []),
                    ...(category ? [{
                        name: `Category ${category.name.charAt(0).toUpperCase()}${category.name.slice(1)}`,
                        url: `/service/category/${category?.parent ? `${category.parent.url}/` : ``}${category.url}`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {category ? (
                        <>
                            <h1>Category {category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h1>
                            <TabMenuWithData
                                menu={
                                    <>
                                        {categoriesList && (
                                            <CategoryTabs
                                                categories_with_services={categoriesList}
                                                active={category.id}
                                            />
                                        )}
                                    </>
                                }
                                data={
                                    <ServiceBrowser categories={categories} />
                                }
                            />
                        </>
                    ) : (
                        <NotFound item="Category" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const primaryUrl = params?.url?.[0];
    const secondaryUrl = params?.url?.[1];

    let category: CategoryWithAll | null = null;
    let categories: number[] | null = null;
    let categoriesList: CategoryWithAllAndServiceCount[] | null = null;

    // Make sure primary URL is set.
    if (primaryUrl) {
        // If we have a secondary URL, we only need to retrieve one category ID.
        if (secondaryUrl) {
            category = await prisma.category.findFirst({
                where: {
                    parent: {
                        url: primaryUrl
                    },
                    url: secondaryUrl
                },
                include: {
                    parent: true,
                    children: true
                }
            });

            if (category)
                categories = [category.id];
        } else {
            // Otherwise, we'll need to retrieve all IDs under this category.
            category = await prisma.category.findFirst({
                where: {
                    url: primaryUrl
                },
                include: {
                    parent: true,
                    children: true
                }
            });

            if (category) {
                categories = [category.id];

                // Now add all children IDs to array.
                categories = [...category.children.map(child => child.id)];
            }
        }

        categoriesList = await prisma.category.findMany({
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
    }

    const globalProps = await GlobalProps();
    
    return {
        props: {
            ...globalProps,
            category: category,
            categories: categories,
            categoriesList: categoriesList
        }
    };
}

export default Page;