import { type GetServerSidePropsContext, type NextPage } from "next";

import { type CategoryWithAllAndAricleCount, type CategoryWithAll } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ArticleBrowser from "@components/blog/article/browser";
import CategoryTabs from "@components/category/tabs";
import TabMenuWithData from "@components/tabs/menu_with_data";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    category?: CategoryWithAll,
    categories?: number[],
    categoriesList?: CategoryWithAllAndAricleCount[]
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
                title={`${category?.name ?? "Not Found"} - Blog - Deaconn`}
                description={`${category?.desc ?? "Not found."}`}
            />
            <Wrapper
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
                                                categories_with_articles={categoriesList}
                                                active={category.id}
                                            />
                                        )}

                                    </>
                                }
                                data={<ArticleBrowser categories={categories} />}
                            />
                        </>
                    ) : (
                        <>
                            <h1>No Category</h1>
                            <p>No article category specified. Please check the URL.</p>
                        </>
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
    let categoriesList: CategoryWithAllAndAricleCount[] | null = null;

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
                // Now add all children IDs to array.
                categories = [category.id, ...category.children.map(child => child.id)];
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
                                Article: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        Article: true
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