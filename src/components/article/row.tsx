import Link from "next/link";

import { type Article } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import Comment from "@utils/icons/comment";
import View from "@utils/icons/view";

const Row: React.FC<{
    article: Article,
    small?: boolean
}> = ({
    article,
    small = false
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const upload_dir = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    const viewUrl = "/blog/view/" + article.url;
    const editUrl = "/blog/new?id=" + article.id;

    const banner = (article.banner) ? cdn + upload_dir + article.banner : "/images/blog/default.jpg";

    const deleteMut = api.blog.delete.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted article #" + article.id + "."}
                />
            ) : (
                <div className={"article-row " + ((small) ? "article-row-sm" : "article-row-lg")}>
                    <div className={"w-full " + ((small) ? "h-48" : "h-72")}>
                        <img src={banner} className="w-full h-full max-h-full" />
                    </div>
                    <div className="">
                        <h3 className="text-white text-2xl font-bold text-center">{article.title}</h3>
                    </div>
                    <div className="pb-6 grow">
                        <p className="text-gray-100 text-sm">{article.desc}</p>
                    </div>
                    <div className="pb-6 flex justify-between text-white text-sm">
                        <div className="flex flex-wrap items-center">
                            <span>
                                <View
                                    classes={["w-6", "h-6", "fill-white"]}
                                />
                            </span>
                            <span className="ml-1">{article.views}</span>
                        </div>
                        <div className="flex flex-wrap items-center">
                            <span>
                                <Comment 
                                    classes={["w-6", "h-6", "fill-white", "stroke-white"]}
                                />
                            </span>
                            <span className="ml-1">{article.comments}</span>
                        </div>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button" href={viewUrl}>Read More</Link>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                        <Link className="w-full button button-delete" href="#" onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this article?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: article.id
                                });
                            }
                        }}>Delete</Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default Row;