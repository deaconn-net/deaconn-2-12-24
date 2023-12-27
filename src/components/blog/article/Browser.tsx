import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type ArticleWithUser } from "~/types/blog/article";

import IconAndText from "@components/containers/IconAndText";
import ArticleRow from "@components/blog/article/Row";

import Loader from "@components/Loader";

import { api } from "@utils/Api";
import AddIcon from "@components/icons/Add";
import { HasRole } from "@utils/user/Auth";

import InfiniteScroll from "react-infinite-scroller";

export default function ArticleBrowser({
    categories
} : {
    categories?: number[]
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Filters.
    const [mostPopular, setMostPopular] = useState(false);
    const [oldest, setOldest] = useState(false);

    let sort = "createdAt";
    let sortDir = "desc";

    if (mostPopular)
        sort = "views";

    if (oldest) {
        sort = "createdAt"
        sortDir = "asc";
    }

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

    const articles: ArticleWithUser[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            articles.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")}
                        onClick={() => setMostPopular(!mostPopular)}
                    >Most Popular</button>
                    <button
                        type="button"
                        className={"button" + ((oldest) ? " !bg-cyan-600" : "")}
                        onClick={() => setOldest(!oldest)}
                    >Oldest</button>
                </div>
                {(HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN")) && (
                    <Link
                        className="button button-primary flex justify-center"
                        href="/blog/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon 
                                    className="w-6 h-6 fill-none"
                                />
                            }
                            text={<>New Article</>}
                            inline={true}
                        />
                    </Link>
                )}
            </div>
            {!data || articles.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                >
                    <div className="grid-view grid-view-lg">
                        {articles.map((article) => {
                            return (
                                <ArticleRow
                                    key={"article-" + article.id.toString()}
                                    article={article}
                                />
                            )
                        })}
                    </div>
                </InfiniteScroll>
            ) : (
                <p>No articles found.</p>
            )}
        </div>
    );
}