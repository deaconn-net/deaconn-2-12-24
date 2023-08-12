import React from "react";
import { type NextPage } from "next";

import { type CategoryWithAllAndAricleCount } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ArticleBrowser from "@components/blog/article/browser";
import CategoryTabs from "@components/category/tabs";
import TabMenuWithData from "@components/tabs/tab_menu_with_data";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    categories?: CategoryWithAllAndAricleCount[]
} & GlobalPropsType> = ({
    categories,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="Blog - Deaconn"
                description="Deaconn's blog includes artiles on technology, programming, security, networking, and more!"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    <h1>Blog</h1>
                    <TabMenuWithData
                        menu={
                            <>
                                {categories && (
                                    <CategoryTabs categories_with_articles={categories} />
                                )}
                            </>
                        }
                        data={
                            <ArticleBrowser />
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

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            categories: categories
        }
    };
}

export default Page;