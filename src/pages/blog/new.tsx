import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { prisma } from "@server/db";

import { type Article } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import Form from '@components/forms/article/new';
import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";

const Page: NextPage<{
    authed: boolean,
    article?: Article,
    categories: CategoryWithChildren[]
}> = ({
    authed,
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
                {authed ? (
                    <div className="content-item">
                        <h1>{article ? "Save" : "Create"} Article</h1>
                        <Form
                            article={article}
                            categories={categories}
                        />
                    </div>
                ) : (
                    <NoPermissions />
                )}

            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { query } = ctx;

    const session = await getSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    const lookup_id = query?.id;
    const lookup_url = query?.url;

    let article: Article | null = null;
    let categories: CategoryWithChildren[] = [];

    if (authed) {
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
    }

    return {
        props: {
            authed: authed,
            article: JSON.parse(JSON.stringify(article)),
            categories: categories
        }
    }
}

export default Page;