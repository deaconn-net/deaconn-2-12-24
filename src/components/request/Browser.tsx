import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type RequestWithService } from "~/types/request";

import IconAndText from "@components/containers/IconAndText";
import RequestRow from "@components/request/Row";
import Loader from "@components/Loader";

import { api } from "@utils/Api";
import AddIcon from "@components/icons/Add";
import { has_role } from "@utils/user/Auth";

import InfiniteScroll from "react-infinite-scroller";

export default function RequestBrowser () {
    // Retrieve session.
    const { data: session } = useSession();

    const statuses: number[] = [];

    // Status filters.
    const [showOpen, setShowOpen] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showAllAdmin, setShowAllAdmin] = useState(false);

    if (showOpen)
        statuses.push(0);

    if (showPending)
        statuses.push(1);

    if (showCompleted)
        statuses.push(2);
    
    // Check if we can view all.
    let canViewAll = false;

    if (session && (has_role(session, "admin") || has_role(session, "moderator")))
        canViewAll = true;

    // Oldest filter.
    const [oldest, setOldest] = useState(false);

    const sort = "updatedAt";
    let sortDir = "desc";

    if (oldest)
        sortDir = "asc";

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.request.getAll.useInfiniteQuery({
        limit: limit,
        viewAll: showAllAdmin,
        statuses: statuses,

        sort: sort,
        sortDir: sortDir
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const requests: RequestWithService[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            requests.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <div className="flex flex-wrap gap-2">
                    <button
                        className={`button ${oldest ? " !bg-cyan-600" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();

                            setOldest(!oldest);
                        }}
                    >{oldest ? "Newest" : "Oldest"}</button>
                    <button
                        className={`button ${showOpen ? "!bg-cyan-600" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();

                            setShowOpen(!showOpen);
                        }}
                    >{showOpen ? "Hide Open" : "Show Open"}</button>
                    <button
                        className={`button ${showPending ? "!bg-cyan-600" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();

                            setShowPending(!showPending);
                        }}
                    >{showPending ? "Hide Pending" : "Show Pending"}</button>
                    <button
                        className={`button ${showCompleted ? "!bg-cyan-600" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();

                            setShowCompleted(!showCompleted);
                        }}
                    >{showCompleted ? "Hide Competed" : "Show Completed"}</button>
                    {canViewAll && (
                        <button
                            className={`button ${showAllAdmin ? "!bg-cyan-600" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();

                                setShowAllAdmin(!showAllAdmin);
                            }}
                        >{showAllAdmin ? "Only Me" : "All Users"}</button>
                    )}
                </div>
                {session && (
                    <Link
                        className="button button-primary flex"
                        href="/request/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon 
                                    className="w-6 h-6 fill-none"
                                />
                            }
                            text={<>New Request</>}
                            inline={true}
                        />
                    </Link>
                )}

            </div>
            {!data || requests.length > 0 ? (
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
                                    {requests.map((request: RequestWithService) => {
                                        return (
                                            <RequestRow
                                                key={`request-${request.id.toString()}`}
                                                request={request}
                                            />
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                </InfiniteScroll>
            ) : (
                <p>No requests found.</p>
            )}
        </div>
    );
}