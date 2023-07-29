import { useSession } from "next-auth/react";
import { useState } from "react";

import { NextPage } from "next";
import Link from "next/link";

import RequestRow from "@components/request/row";
import Wrapper from "@components/wrapper";

import { api } from "@utils/api";
import { type RequestWithService } from "~/types/request";

import Loader from "@utils/loader";

import InfiniteScroll from "react-infinite-scroller";

const Page: NextPage = () => {
    // Session
    const { data: session } = useSession();

    // Filters
    const [oldest, setOldest] = useState(false);

    let sort = "updatedAt";
    let sortDir = "desc";

    if (oldest)
        sortDir = "asc";

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.request.getAll.useInfiniteQuery({
        limit: limit,

        sort: sort,
        sortDir: sortDir
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCur,
        });

    if (!session) {
        return (
            <p className="text-white">You must be logged in to view you requests.</p>
        );
    }

    const loadMore = () => {
        fetchNextPage();
    }

    const items: RequestWithService[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            if (pg.items.length < limit && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <Wrapper>
            <div className="content">
                <h1 className="content-title">My Requests</h1>
                <div className="p-6 flex justify-between">
                    <Link href="#" className={"button" + ((oldest) ? " !bg-cyan-600" : "")} onClick={(e) => {
                        e.preventDefault();

                        if (oldest)
                            setOldest(false);
                        else
                            setOldest(true);
                    }}>Oldest</Link>
                    <Link href="/request/new" className="button button-secondary flex">
                        <span><svg className="w-6 h-6 fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="fill-white" /><path d="M9 12H15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9L12 15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="stroke-white" strokeWidth="2" /></svg></span>
                        <span className="ml-2">New Request</span>
                    </Link>
                </div>
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                >
                    <>
                        {data && (
                            <table className="w-full table-auto border-spacing-2 border-collapse">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Service</th>
                                        <th>Created</th>
                                        <th>Last Updated</th>
                                        <th>Status</th>
                                        <th>Accepted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((request: RequestWithService) => {
                                        return (
                                            <RequestRow
                                                key={"request-" + request.id}
                                                request={request}
                                            />
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                </InfiniteScroll>
            </div>
        </Wrapper>
    );
}

export default Page;