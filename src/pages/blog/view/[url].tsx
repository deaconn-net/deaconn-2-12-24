import { type GetServerSidePropsContext, type NextPage } from "next";

import { type ArticleWithUser } from "~/types/blog/article";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import NotFound from "@components/error/NotFound";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import ArticleView from "@components/blog/article/View";

const Page: NextPage<{
    article?: ArticleWithUser,
} & GlobalPropsType> = ({
    article,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`${article?.title ?? "Not Found!"} - Blog - Deaconn`}
                description={`${article?.desc ?? "Article not found."}`}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Blog",
                        url: "/blog"
                    },
                    ...(article ? [{
                        name: `${article.title}`,
                        url: `/blog/view/${article.url}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {article ? (
                        <ArticleView
                            article={article}
                        />
                    ) : (
                        <NotFound item="Article" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve lookup URL.
    const { params } = ctx;

    const url = params?.url?.toString();

    // Initialize article.
    let article: ArticleWithUser | null = null;

    // If URL exists, retrieve article.
    if (url) {
        article = await prisma.article.findFirst({
            where: {
                url: url
            },
            include: {
                user: true
            }
        });
    }

    // Increment view count.
    if (article) {
        await prisma.article.update({
            where: {
                id: article.id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return { 
        props: {
            ...globalProps,
            article: JSON.parse(JSON.stringify(article))
        }
    };
}

export default Page;