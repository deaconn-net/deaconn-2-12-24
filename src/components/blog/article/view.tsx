import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { type ArticleWithUser } from "~/types/blog/article";

import { ErrorCtx, SuccessCtx } from "@components/wrapper";
import { UserLink } from "@components/user/link";
import Markdown from "@components/markdown";

import { api } from "@utils/api";
import { dateFormat, dateFormatFour } from "@utils/date";
import { has_role } from "@utils/user/auth";

import TwitterIcon from "@utils/icons/social/twitter";
import FacebookIcon from "@utils/icons/social/facebook";
import LinkedinIcon from "@utils/icons/social/linkedin";

const ArticleView: React.FC<{
    article: ArticleWithUser
}> = ({
    article
}) => {
    // Error and success handling handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile links.
    const editUrl = `/blog/edit/${article?.id?.toString()}`;

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE ?? "");

    if (article.banner)
        banner = cdn + uploadUrl + article.banner;

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation();

    if (deleteMut.isError && errorCtx) {
        console.error(deleteMut.error.message);

        errorCtx.setTitle("Failed To Delete Article");
        errorCtx.setMsg("Failed to delete article. Please check your console for more details.");
    } else if (deleteMut.isSuccess && successCtx) {
        successCtx.setTitle("Successfully Deleted Article!");
        successCtx.setMsg("Successfully deleted article! Please reload the page.");
    }

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
    );
}

export default ArticleView;