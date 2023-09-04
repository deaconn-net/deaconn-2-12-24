import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type ArticleWithUser } from "~/types/blog/article";

import UserLink from "@components/user/Link";
import Markdown from "@components/markdown/Markdown";

import { api } from "@utils/Api";
import { dateFormat, dateFormatFour } from "@utils/Date";
import { has_role } from "@utils/user/Auth";

import TwitterIcon from "@components/icons/social/Twitter";
import FacebookIcon from "@components/icons/social/Facebook";
import LinkedinIcon from "@components/icons/social/Linkedin";
import { ScrollToTop } from "@utils/Scroll";
import IconAndText from "@components/containers/IconAndText";

export default function ArticleView ({
    article
} : {
    article: ArticleWithUser
}) {
    // Error and success handling handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    // Compile links.
    const editUrl = `/blog/edit/${article?.id?.toString()}`;

    // Retrieve banner.
    let banner = process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE || undefined;

    if (article.banner)
        banner = uploadUrl + article.banner;

    // Retrieve user avatar.
    let userAvatar = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE || undefined;

    if (article.user?.avatar)
        userAvatar = uploadUrl + article.user.avatar;

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Article");
                errorCtx.setMsg("Failed to delete article. Please check your console for more details.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Article!");
                successCtx.setMsg("Successfully deleted article! Please reload the page."); 

                ScrollToTop();
            }
        }
    });

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
    const [articleEditedAt, setArticleEditedAt] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!article)
            return;

        if (!articleCreatedAt)
            setArticleCreatedAt(dateFormat(article.createdAt, dateFormatFour));

        if (!articleEditedAt)
            setArticleEditedAt(dateFormat(article.lastEdited, dateFormatFour));
    }, [article, articleCreatedAt, articleEditedAt]);
    
    return (
        <div className="flex flex-col gap-4">
            {banner && (
                <div className="w-full flex justify-center">
                    <Image
                        className="w-full max-h-[32rem] max-w-full min-h-[32rem] object-cover"
                        src={banner}
                        width={500}
                        height={500}
                        alt="Banner"
                        priority={true}
                    />
                </div>
            )}
            <h1>{article.title}</h1>
            <div className="w-full bg-gradient-to-b from-deaconn-data to-deaconn-data2 p-6 rounded-sm flex flex-col gap-4">
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
                        {articleEditedAt && (
                            <p>Updated On <span className="font-bold">{articleEditedAt}</span></p>
                        )}
                    </div>
                </div>
                <Markdown rehype={true}>
                    {article.content}
                </Markdown>
                <hr />
                <div className="flex flex-col gap-2">
                    <h3>Share!</h3>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                            target="_blank"
                        >
                            <TwitterIcon
                                className="h-6 w-6 fill-gray-400 hover:fill-white"
                            />
                        </Link>
                        <Link
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                        >
                            <FacebookIcon
                                className="h-6 w-6 fill-gray-400 hover:fill-white"
                            />
                        </Link>
                        <Link
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                        >
                            <LinkedinIcon
                                className="h-6 w-6 fill-gray-400 hover:fill-white"
                            />
                        </Link>
                    </div>
                </div>
                <hr />
                {article.user && article.user.aboutMe && (
                    <div className="flex flex-col gap-2">
                        <h3>
                            {userAvatar ? (
                                <div>
                                    <IconAndText
                                        icon={
                                            <Image
                                                src={userAvatar}
                                                width={64}
                                                height={64}
                                                alt="User Avatar"
                                                className="rounded-full"
                                            />
                                        }
                                        text={<>About <UserLink user={article.user} /></>}
                                        inline={true}
                                    />
                                </div>
                            ) : (
                                <>About {article.user.name ?? "N/A"}</>
                            )}
                        </h3>
                        <div>
                            <Markdown className="text-sm">
                                {article.user.aboutMe ?? "N/A"}
                            </Markdown>
                        </div>
                    </div>
                )}
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