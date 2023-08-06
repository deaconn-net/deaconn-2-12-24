import { type GetServerSidePropsContext, type NextPage } from "next";

import { type Article } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import Form from '@components/forms/article/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { prisma } from "@server/db";

const Page: NextPage<{
    article: Article | null,
    categories: CategoryWithChildren[]
}> = ({
    article,
    categories
}) => {
    return (
        <>
            <Meta
                title="New Article - Blog - Deaconn"
                robots="noindex"
            />
            <Wrapper>
                <div className="content-item">
                    <h1>Create Article</h1>
                    <Form
                        article={article ?? undefined}
                        categories={categories}
                    />
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let article: Article | null = null;
    let categories: CategoryWithChildren[] = [];

    if (lookup_id || lookup_url) {
        article = await prisma.article.findFirst({
            where: {
                ...(lookup_id && {
                    id: Number(lookup_id.toString())
                }),
                ...(lookup_url && {
                    url: lookup_url.toString()
                })
            }
        });
    }

    categories = await prisma.category.findMany({
        where: {
            parent: null
        },
        include: {
            children: true
        }
    });

    return {
        props: {
            article: JSON.parse(JSON.stringify(article)),
            categories: categories
        }
    }
}

export default Page;