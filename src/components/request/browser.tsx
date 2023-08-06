import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type RequestWithService } from "~/types/request";

import IconAndText from "@components/containers/icon_and_text";
import RequestRow from "@components/request/row";

import { api } from "@utils/api";
import AddIcon from "@utils/icons/add";
import { has_role } from "@utils/user/auth";
import Loader from "@utils/loader";

import InfiniteScroll from "react-infinite-scroller";

const RequestBrowser: React.FC = () => {
    // Retrieve session.
    const { data: session } = useSession();

    // Filters.
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
        <div className="request-browser">
            <div className="request-browser-buttons">
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
                {session && (has_role(session, "moderator") || has_role(session, "admin")) && (
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
                )}

            </div>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadMore}
                loader={<Loader key={"loader"} />}
                hasMore={requireItems}
            >
                <>
                    {data && (
                        <>
                            {data && (
                                <table className="request-browser-table">
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
                    )}
                </>
            </InfiniteScroll>
        </div>
    );
}

export default RequestBrowser;