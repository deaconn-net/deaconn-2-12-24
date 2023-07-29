import { GetServerSidePropsContext, NextPage } from "next";

import { type Article, type User } from "@prisma/client";

import { prisma } from "@server/db";

import { UserLink } from "@components/user/link";
import Wrapper from "@components/wrapper";
import NotFound from "@components/errors/not_found";

import { dateFormat, dateFormatOne } from "@utils/date";

import ReactMarkdown from "react-markdown";

type ArticleType = Article & {
    user: User | null;
};

const Page: NextPage<{
    article: ArticleType | null
}> = ({
    article
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const image = cdn + article?.banner + "/images/blog/default.jpg";

    let createdAt: string | null = null;
    let updatedAt: string | null = null;

    if (article) {
        createdAt = dateFormat(article.createdAt, dateFormatOne);
        updatedAt = dateFormat(article.updatedAt, dateFormatOne);
    }

    return (
        <Wrapper>
            <div className="content">
                {article ? (
                    <>
                        <div className="w-full flex justify-center">
                            <img src={image} className="w-[67.5rem] h-[33.75rem] max-h-full border-2 border-solid border-cyan-900 rounded-t" alt="Banner" />
                        </div>
                        <h1 className="content-title">{article.title}</h1>
                        <div className="w-full bg-cyan-900 p-6 rounded-sm">
                            <div className="text-white text-sm italic pb-4">
                                {article.user && (
                                    <p>Created By <span className="font-bold"><UserLink user={article.user} /></span></p>
                                )}
                                {createdAt && (
                                    <p>Created On <span className="font-bold">{createdAt}</span></p>
                                )}
                                {updatedAt && (
                                    <p>Updated On <span className="font-bold">{updatedAt}</span></p>
                                )}

                            </div>
                            <ReactMarkdown
                                className="text-gray-100 markdown"
                            >{article.content}</ReactMarkdown>
                        </div>
                    </>
                ) : (
                    <NotFound item="Article" />
                )}
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let article: ArticleType | null = null;

    const url = (ctx?.params?.article) ? ctx.params.article[0] ?? null : null;

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

    return { 
        props: { 
            article: JSON.parse(JSON.stringify(article))
        }
    };
}

export default Page;