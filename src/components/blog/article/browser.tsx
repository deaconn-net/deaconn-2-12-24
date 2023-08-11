import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type Article } from "@prisma/client";

import IconAndText from "@components/containers/icon_and_text";
import ArticleRow from "@components/blog/article/row";

import { api } from "@utils/api";
import AddIcon from "@utils/icons/add";
import { has_role } from "@utils/user/auth";
import Loader from "@utils/loader";

import InfiniteScroll from "react-infinite-scroller";

const ArticleBrowser: React.FC<{
    categories?: number[]
}> = ({
    categories
}) => {
    // Retrieve session.
    const { data: session } = useSession();

    // Filters.
    const [mostPopular, setMostPopular] = useState(false);
    const [oldest, setOldest] = useState(false);

    let sort = "createdAt";
    let sortDir = "desc";

    if (mostPopular)
        sort = "views";

    if (oldest)
        sortDir = "asc";

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.blog.getAll.useInfiniteQuery({
        limit: limit,
        categories: categories,

        sort: sort,
        sortDir: sortDir
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const articles: Article[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            articles.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }
    
    return (
        <div className="article-browser">
            <div className="article-browser-buttons">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Link
                        className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")}
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();

                            if (mostPopular)
                                setMostPopular(false);
                            else
                                setMostPopular(true);
                        }}
                    >Most Popular</Link>
                    <Link
                        className={"button" + ((oldest) ? " !bg-cyan-600" : "")}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();

                            if (oldest)
                                setOldest(false);
                            else
                                setOldest(true);
                        }}
                    >Oldest</Link>
                </div>
                {session && (has_role(session, "contributor") || has_role(session, "admin")) && (
                    <Link
                        className="button button-primary flex justify-center"
                        href="/blog/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon 
                                    classes={["w-6", "h-6", "fill-none"]}
                                />
                            }
                            text={<>New Article</>}
                            inline={true}
                        />
                    </Link>
                )}
            </div>
            {data && articles.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                    className={"grid-view grid-view-sm"}
                >
                    <>
                        {articles.map((article: Article) => {
                            return (
                                <ArticleRow
                                    key={"article-" + article.id.toString()}
                                    article={article}
                                />
                            )
                        })}
                    </>
                </InfiniteScroll>
            ) : (
                <p>No articles found.</p>
            )}
        </div>
    );
}

export default ArticleBrowser;