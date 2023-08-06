import React from "react";
import { type NextPage } from "next";

import { type CategoryWithAllAndAricleCount } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ArticleBrowser from "@components/blog/article/browser";
import CategoryTabs from "@components/category/tabs";

const Page: NextPage<{
    categories?: CategoryWithAllAndAricleCount[]
}> = ({
    categories
}) => {
    return (
        <>
            <Meta
                title="Blog - Deaconn"
                description="Deaconn's blog includes artiles on technology, programming, security, networking, and more!"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Blog</h1>
                    <div className="flex flex-wrap gap-2">
                        {categories && (
                            <div>
                                <CategoryTabs
                                    categories_with_articles={categories}
                                />
                            </div>
                        )}

                        <div className="grow p-6 flex flex-col gap-4">
                            <ArticleBrowser />
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

    return {
        props: {
            categories: categories
        }
    };
}

export default Page;