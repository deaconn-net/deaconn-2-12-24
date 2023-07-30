import { useState } from "react";

import { NextPage } from "next";
import Link from "next/link";

import Wrapper from "@components/wrapper";
import ArticleRow from "@components/blog/article/row";
import Meta from "@components/meta";

import { type Article } from "@prisma/client";

import { api } from "@utils/api";
import Loader from "@utils/loader";

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
        fetchNextPage();
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
        <Wrapper>
            <Meta
                title="Blog - Deaconn"
            />
            <div className="content">
                <h1 className="content-title">Blog</h1>
                <div className="p-6 flex flex-wrap justify-between">
                    <div className="flex gap-2">
                        <Link href="#" className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")} onClick={(e) => {
                            e.preventDefault();

                            if (mostPopular)
                                setMostPopular(false);
                            else
                                setMostPopular(true);

                        }}>Most Popular</Link>
                        <Link href="#" className={"button" + ((oldest) ? " !bg-cyan-600" : "")} onClick={(e) => {
                            e.preventDefault();

                            if (oldest)
                                setOldest(false);
                            else
                                setOldest(true);
                        }}>Oldest</Link>
                    </div>
                    <Link href="/blog/new" className="button button-secondary flex">
                        <span><svg className="w-6 h-6 fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="fill-white" /><path d="M9 12H15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9L12 15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="stroke-white" strokeWidth="2" /></svg></span>
                        <span className="ml-2">New Article</span>
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
                                            key={"article-" + article.id}
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
    )
}

export default Page;