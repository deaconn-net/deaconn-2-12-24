import { useEffect, useState } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type ArticleWithUser } from "~/types/blog/article";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import { UserLink } from "@components/user/link";
import NotFound from "@components/errors/not_found";

import { api } from "@utils/api";
import { dateFormat, dateFormatFour } from "@utils/date";
import SuccessBox from "@utils/success";
import { has_role } from "@utils/user/auth";
import TwitterIcon from "@utils/icons/social/twitter";
import FacebookIcon from "@utils/icons/social/facebook";
import LinkedinIcon from "@utils/icons/social/linkedin";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

import Markdown from "@components/markdown";

const Page: NextPage<{
    article?: ArticleWithUser,
} & GlobalPropsType> = ({
    article,

    footerServices,
    footerPartners
}) => {
    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile links.
    const editUrl = `/blog/edit/${article?.id?.toString() ?? ""}`;

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE ?? "");

    if (article?.banner)
        banner = cdn + uploadUrl + article.banner;

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation();

    // Retrieve base URL.
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        if (typeof window != "undefined")
            setBaseUrl(`${window.location.protocol}//${window.location.host}`)
    }, [])

    // Sharing.
    const shareUrl = `${baseUrl}/blog/view/${article?.url ?? ""}`;
    const shareText = `I'm sharing this article! ${encodeURI(shareUrl)}`;
    const encodedText = encodeURI(shareText);

    // Dates.
    const [articleCreatedAt, setArticleCreatedAt] = useState<string | undefined>(undefined);
    const [articleUpdatedAt, setArticleUpdatedAt] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!article)
            return;

        if (!articleCreatedAt)
            setArticleCreatedAt(dateFormat(article.createdAt, dateFormatFour));

        if (!articleUpdatedAt)
            setArticleUpdatedAt(dateFormat(article.updatedAt, dateFormatFour));
    }, [article, articleCreatedAt, articleUpdatedAt]);

    return (
        <>
            <Meta
                title={`${article?.title ?? "Not Found!"} - Blog - Deaconn`}
                description={`${article?.desc ?? "Article not found."}`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
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
                                <div className="flex justify-between flex-wrap text-white text-sm">
                                    <div>
                                        {article.user && (
                                            <p>Created By <span className="font-bold"><UserLink user={article.user} /></span></p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {articleCreatedAt && (
                                            <p>Created On <span className="font-bold">{articleCreatedAt}</span></p>
                                        )}
                                        {articleUpdatedAt && (
                                            <p>Updated On <span className="font-bold">{articleUpdatedAt}</span></p>
                                        )}
                                    </div>
                                </div>
                                <Markdown>
                                    {article.content}
                                </Markdown>
                                <div className="flex flex-col gap-2">
                                    <h2>Share!</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                                            target="_blank"
                                        >
                                            <TwitterIcon
                                                classes={[
                                                    "h-6",
                                                    "w-6",
                                                    "fill-gray-400",
                                                    "hover:fill-white"
                                                ]}
                                            />
                                        </Link>
                                        <Link
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                            target="_blank"
                                        >
                                            <FacebookIcon
                                                classes={[
                                                    "h-6",
                                                    "w-6",
                                                    "fill-gray-400",
                                                    "hover:fill-white"
                                                ]}
                                            />
                                        </Link>
                                        <Link
                                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                            target="_blank"
                                        >
                                            <LinkedinIcon
                                                classes={[
                                                    "h-6",
                                                    "w-6",
                                                    "fill-gray-400",
                                                    "hover:fill-white"
                                                ]}
                                            />
                                        </Link>
                                    </div>
                                </div>
                                {session && (has_role(session, "admin") || has_role(session, "moderator")) && (
                                    <div className="flex flex-wrap justify-center gap-4">
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
    // Retrieve URL.
    const { params } = ctx;

    const url = params?.url?.toString();

    // Initialize article.
    let article: ArticleWithUser | null = null;

    // If URL exists, retrieve URL.
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

    const globalProps = await GlobalProps();

    return { 
        props: {
            ...globalProps,
            article: JSON.parse(JSON.stringify(article))
        }
    };
}

export default Page;