import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import { type Article } from "@prisma/client";

import IconAndText from "@components/containers/icon_and_text";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import CommentIcon from "@utils/icons/comment";
import ViewIcon from "@utils/icons/view";
import { has_role } from "@utils/user/auth";

const ArticleRow: React.FC<{
    article: Article,
    small?: boolean
}> = ({
    article,
    small = false
}) => {
    const { data: session } = useSession();
    // Retrieve some environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile links.
    const viewUrl = "/blog/view/" + article.url;
    const editUrl = "/blog/new?id=" + article.id.toString();

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE ?? "");

    if (article.banner)
        banner =  cdn + uploadUrl + article.banner;

    // Prepare delete mutation.
    const deleteMut = api.blog.delete.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted article #" + article.id.toString() + "."}
                />
            ) : (
                <div className={"article-row " + ((small) ? "article-row-sm" : "article-row-lg")}>
                    <div className="article-row-image">
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
                                    classes={["w-6", "h-6", "fill-white"]}
                                />
                            }
                            text={<>{article.views}</>}
                            inline={true}
                        />
                        <IconAndText
                            icon={
                                <CommentIcon 
                                    classes={["w-6", "h-6", "fill-white", "stroke-white"]}
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
                    {session && (has_role(session, "admin") || has_role(session, "moderator")) && (
                        <div className="article-row-actions">
                            <Link
                                className="button button-primary"
                                href={editUrl}
                            >Edit</Link>
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
                        </div>
                    )}

                </div>
            )}
        </>
    );
}

export default ArticleRow;