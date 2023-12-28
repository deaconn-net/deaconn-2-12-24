import { useContext } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type ArticleWithUser } from "~/types/blog/article";

import IconAndText from "@components/containers/IconAndText";

import { api } from "@utils/Api";
import CommentIcon from "@components/icons/Comment";
import ViewIcon from "@components/icons/View";
import { HasRole } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import UserLink from "@components/user/Link"

export default function ArticleRow ({
    article,
    simple = false
} : {
    article: ArticleWithUser
    simple?: boolean
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve some environmental variables.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    // Compile links.
    const viewUrl = `/blog/view/${article.url}`;
    const editUrl = `/blog/edit/${article.id.toString()}`;

    // Retrieve banner.
    let banner = process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_IMAGE || undefined;

    if (article.banner)
        banner =  uploadUrl + article.banner;

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

    const isContributor = HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN");
    const isMod = HasRole(session, "MODERATOR") || HasRole(session, "ADMIN");

    return (
        <div className={`w-full bg-gradient-to-b from-deaconn-data to-deaconn-data2 shadow-lg shadow-black rounded flex flex-col gap-2 ring-4 ring-deaconn-ring hover:ring-deaconn-ring2 hover:duration-150 translate-y-0 hover:-translate-y-1 group ${simple ? "h-96" : "h-auto"}`}>
            {banner && (
                <div className={`${simple ? "h-1/2" : "h-64"}`}>
                    <Link href={viewUrl}>
                        <Image
                            src={banner}
                            width={600}
                            height={400}
                            className="h-full max-h-full w-full filter brightness-[85%] group-hover:brightness-100 rounded-t object-cover"
                            alt="Article Banner"
                        />
                    </Link>
                </div>
            )}
            <div>
                <h3 className="text-lg text-bold text-center text-white hover:text-blue-200 not-italic">
                    <Link href={viewUrl}>{article.title}</Link>
                </h3>
            </div>
            <div className={`px-2 ${simple ? "max-h-16 overflow-hidden overflow-ellipsis whitespace-nowrap" : ""}`}>
                <span className="text-sm">{article.desc}</span>
            </div>
            <div className="grow"></div>
            <div className="px-6 py-2 flex flex-wrap justify-between text-white text-sm">
                <IconAndText
                    icon={
                        <ViewIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{article.views}</>}
                    inline={true}
                />
                {article.user && (
                    <span>By <UserLink user={article.user} /></span>
                )}
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
            {!simple && (
                <div className="px-6 py-4 flex justify-center">
                    <Link
                        className="button w-full"
                        href={viewUrl}
                    >Read More</Link>
                </div>
            )}
            
            {(!simple && (isContributor || isMod)) && (
                <div className="px-6 py-4 flex flex-wrap gap-2 justify-center">
                    {isContributor && (
                        <Link
                            className="button button-primary w-full"
                            href={editUrl}
                        >Edit</Link>
                    )}
                    {isMod && (
                        <button
                            type="button"
                            className="button button-danger w-full"
                            onClick={() => {
                                const yes = confirm("Are you sure you want to delete this article?");

                                if (yes) {
                                    deleteMut.mutate({
                                        id: article.id
                                    });
                                }
                            }}
                        >Delete</button>
                    )}
                </div>
            )}
        </div>
    );
}