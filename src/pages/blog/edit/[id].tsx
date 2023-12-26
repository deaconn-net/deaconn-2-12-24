import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Article } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ArticleForm from '@components/forms/article/New';
import NoPermissions from "@components/error/NoPermissions";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import NotFound from "@components/error/NotFound";
import { useSession } from "next-auth/react";

export default function Page ({
    article,
    categories,

    footerServices,
    footerPartners
} : {
    article?: Article
    categories: CategoryWithChildren[]
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = has_role(session, "contributor") || has_role(session, "admin");

    return (
        <>
            <Meta
                title="New Article - Blog - Deaconn"
                robots="noindex"
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Blog",
                        url: "/blog"
                    },
                    {
                        name: "Editing"
                    },
                    ...(article ? [{
                        name: article.title,
                        url: `/blog/view/${article.url}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && article) ? (
                    <div className="content-item2">
                        <div>
                            <h2>Edit Article {article.title}</h2>
                        </div>
                        <div>
                            <ArticleForm
                                article={article}
                                categories={categories}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Article" />
                        )}
                    </>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we're authenticated.
    const authed = has_role(session, "contributor") || has_role(session, "admin");

    // Retrieve lookup ID.
    const { params } = ctx;

    const lookupId = params?.id?.toString();

    // Initialize article and categories.
    let article: Article | null = null;
    let categories: CategoryWithChildren[] = [];

    if (lookupId && authed) {
        // Retrieve article and categories.
        article = await prisma.article.findFirst({
            where: {
                id: Number(lookupId)
            }
        });

        categories = await prisma.category.findMany({
            where: {
                parent: null
            },
            include: {
                children: true
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            article: JSON.parse(JSON.stringify(article)),
            categories: categories
        }
    }
}