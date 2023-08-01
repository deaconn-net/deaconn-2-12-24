import { useSession } from "next-auth/react";
import { useState } from "react";

import { type RequestWithService } from "~/types/request";

import { type NextPage } from "next";
import Link from "next/link";

import RequestRow from "@components/request/row";
import Wrapper from "@components/wrapper";

import { api } from "@utils/api";
import Loader from "@utils/loader";
import AddIcon from "@utils/icons/add";
import IconAndText from "@components/containers/icon_and_text";

import InfiniteScroll from "react-infinite-scroller";

const Page: NextPage = () => {
    // Session
    const { data: session } = useSession();

    // Filters
    const [oldest, setOldest] = useState(false);

    const sort = "updatedAt";
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
        void fetchNextPage();
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
                <h1>My Requests</h1>
                <div className="p-6 flex justify-between">
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
                    <Link
                        className="button button-primary flex"
                        href="/request/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon
                                    classes={["w-6", "h-6", "fill-none"]}
                                />
                            }
                            text={<>New Request</>}
                            inline={true}
                        />
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
                                                key={"request-" + request.id.toString()}
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