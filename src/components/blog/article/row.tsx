import { useContext } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Article } from "@prisma/client";

import IconAndText from "@components/containers/icon_and_text";

import { api } from "@utils/api";
import CommentIcon from "@components/icons/comment";
import ViewIcon from "@components/icons/view";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";

export default function ArticleRow ({
    article
} : {
    article: Article
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve some environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile links.
    const viewUrl = `/blog/view/${article.url}`;
    const editUrl = `/blog/edit/${article.id.toString()}`;

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE ?? "");

    if (article.banner)
        banner =  cdn + uploadUrl + article.banner;

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Article");
                errorCtx.setMsg("Failed to delete article. Check your console for more details.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Article!");
                successCtx.setMsg("Successfully deleted article! Please refresh the page.");

                ScrollToTop();
            }
        }
    });

    return (
        <div className="article-row">
            <div className="grid-view-image">
                <Link href={viewUrl}>
                    <Image
                        src={banner}
                        width={600}
                        height={400}
                        alt="Article Banner"
                    />
                </Link>
            </div>
            <div className="article-row-title">
                <h3>
                    <Link href={viewUrl}>{article.title}</Link>
                </h3>
            </div>
            <div className="article-row-description">
                <p>{article.desc}</p>
            </div>
            <div className="article-row-stats">
                <IconAndText
                    icon={
                        <ViewIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{article.views}</>}
                    inline={true}
                />
                <IconAndText
                    icon={
                        <CommentIcon 
                            className="w-6 h-6 fill-white stroke-white"
                        />
                    }
                    text={<>{article.comments}</>}
                    inline={true}
                />
            </div>
            <div className="article-row-read-more">
                <Link
                    className="button"
                    href={viewUrl}
                >Read More</Link>
            </div>
            {session && (
                <div className="article-row-actions">
                    {(has_role(session, "contributor") || has_role(session, "admin")) && (
                        <Link
                            className="button button-primary"
                            href={editUrl}
                        >Edit</Link>
                    )}

                    {(has_role(session, "moderator") || has_role(session, "admin")) && (
                        <Link
                            className="button button-danger"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();

                                const yes = confirm("Are you sure you want to delete this article?");

                                if (yes) {
                                    deleteMut.mutate({
                                        id: article.id
                                    });
                                }
                            }}
                        >Delete</Link>
                    )}
                </div>
            )}
        </div>
    );
}