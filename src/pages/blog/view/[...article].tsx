import { type GetServerSidePropsContext, type NextPage } from "next";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type Article, type User } from "@prisma/client";

import { prisma } from "@server/db";

import { UserLink } from "@components/user/link";
import Wrapper from "@components/wrapper";
import NotFound from "@components/errors/not_found";
import Meta from "@components/meta";

import { api } from "@utils/api";
import { dateFormat, dateFormatOne } from "@utils/date";
import SuccessBox from "@utils/success";
import { has_role } from "@utils/user/auth";

import ReactMarkdown from "react-markdown";

type ArticleType = Article & {
    user: User | null;
};

const Page: NextPage<{
    article: ArticleType | null,
    createdAtDate: string | null,
    updatedAtDate: string | null
}> = ({
    article,
    createdAtDate,
    updatedAtDate
}) => {
    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile links.
    const editUrl = "/blog/new?id=" + (article?.id?.toString() ?? "");

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE ?? "");

    if (article?.banner) {
        banner = cdn + uploadUrl + article.banner;
    }

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation();

    return (
        <>
            <Meta
                title={`${article?.title ?? "Not Found!"} - Blog - Deaconn`}
                description={`${article?.desc ?? "Article not found."}`}
            />
            <Wrapper>
                <div className="content-item">
                    {deleteMut.isSuccess && (
                        
                        <SuccessBox
                            title="Successfully Deleted Article!"
                            msg={`Deleted article ${article?.title}. Please reload the page.`}
                        />
                    )}

                    {article ? (
                        <div className="flex flex-col gap-4">
                            <div className="w-full flex justify-center">
                                <Image
                                    className="max-h-[32rem] max-w-full min-h-[32rem]"
                                    src={banner}
                                    width={500}
                                    height={500}
                                    alt="Banner"
                                />
                            </div>
                            <h1>{article.title}</h1>
                            <div className="w-full bg-gray-800 p-6 rounded-sm flex flex-col gap-4">
                                <div className="flex justify-between text-white text-sm">
                                    <div>
                                        {article.user && (
                                            <p>Created By <span className="font-bold"><UserLink user={article.user} /></span></p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {createdAtDate && (
                                            <p>Created On <span className="font-bold">{createdAtDate}</span></p>
                                        )}
                                        {updatedAtDate && (
                                            <p>Updated On <span className="font-bold">{updatedAtDate}</span></p>
                                        )}
                                    </div>
                                </div>
                                <ReactMarkdown className="markdown">
                                    {article.content}
                                </ReactMarkdown>
                                {session && (has_role(session, "admin") || has_role(session, "moderator")) && (
                                    <div className="flex flex-wrap gap-4">
                                        <Link
                                            href={editUrl}
                                            className="button button-primary"
                                        >Edit</Link>
                                        <button
                                            className="button button-danger"
                                            onClick={(e) => {
                                                e.preventDefault();

                                                const yes = confirm("Are you sure you want to delete this article?");

                                                if (yes) {
                                                    deleteMut.mutate({
                                                        id: article.id
                                                    });
                                                }
                                            }}
                                        >Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <NotFound item="Article" />
                    )}
                </div>
            </Wrapper>
        </>
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

    // We need to parse the dates now, on the server-side.
    let createdAtDate: string | null = null;

    if (article)
        createdAtDate = dateFormat(article.createdAt, dateFormatOne);

    let updatedAtDate: string | null = null;

    if (article)
        updatedAtDate = dateFormat(article.updatedAt, dateFormatOne);

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

    return { 
        props: { 
            article: JSON.parse(JSON.stringify(article)),
            createdAtDate: createdAtDate,
            updatedAtDate: updatedAtDate
        }
    };
}

export default Page;