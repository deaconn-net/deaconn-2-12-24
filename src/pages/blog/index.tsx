import { useState } from "react";

import { type NextPage } from "next";
import Link from "next/link";

import Wrapper from "@components/wrapper";
import ArticleRow from "@components/blog/article/row";
import Meta from "@components/meta";
import IconAndText from "@components/containers/icon_and_text";

import { type Article } from "@prisma/client";

import { api } from "@utils/api";
import Loader from "@utils/loader";
import AddIcon from "@utils/icons/add";

import InfiniteScroll from "react-infinite-scroller";

const Page: NextPage = () => {
    const limit = 10;

    // Filters.
    const [mostPopular, setMostPopular] = useState(false);
    const [oldest, setOldest] = useState(false);

    let sort = "createdAt";
    let sortDir = "desc";

    if (mostPopular) {
        sort = "views";
    }

    if (oldest) {
        sortDir = "asc";
    }

    const [requireItems, setRequireItems] = useState(true);

    const { data, fetchNextPage } = api.blog.getAll.useInfiniteQuery({
        limit: limit,

        sort: sort,
        sortDir: sortDir
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const items: Article[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            <Meta
                title="Blog - Deaconn"
                description="Deaconn's blog includes artiles on technology, programming, security, networking, and more!"
            />
            <Wrapper>
                <Meta
                    title="Blog - Deaconn"
                />
                <div className="content">
                    <h1>Blog</h1>
                    <div className="p-6 flex flex-wrap justify-between">
                        <div className="flex flex-wrap gap-2">
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
                        <Link
                            className="button button-primary flex"
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
                    </div>
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={loadMore}
                        loader={<Loader key={"loader"} />}
                        hasMore={requireItems}
                        className={"grid-view grid-view-center grid-view-lg"}
                    >
                        <>
                            {data && (
                                <>
                                    {items.map((article: Article) => {
                                        return (
                                            <ArticleRow
                                                key={"article-" + article.id.toString()}
                                                article={article}
                                            />
                                        )
                                    })}
                                </>
                            )}
                        </>
                    </InfiniteScroll>
                </div>
            </Wrapper>
        </>
    );
}

export default Page;