import { useState } from "react";

import { type User } from "@prisma/client";

import UserTableRow from "@components/user/row/table";
import UserGridRow from "@components/user/row/grid";

import { api } from "@utils/api";
import Loader from "@utils/loader";

import InfiniteScroll from "react-infinite-scroller";

const UserBrowser: React.FC<{
    grid?: boolean
}> = ({
    grid
}) => {
    // Set limit of users per page.
    const limit = 10;

    // Filters
    const [search, setSearch] = useState<string | undefined>(undefined);
    //const [searchMode, setSearchMode] = useState(0);

    // Sorting.
    //const [sort, setSort] = useState("id");
    //const [sortDir, setSortDir] = useState("desc");

    // Require items.
    const [requireItems, setRequireItems] = useState(true);

    // Use infinite query.
    const { data, fetchNextPage } = api.admin.getUsers.useInfiniteQuery({
        limit: limit,
        
        search: search
    }, {
        getNextPageParam: (lastPage) => lastPage.nextUser
    });

    // Handle loading more users.
    const loadMore = () => {
        void fetchNextPage();
    }

    // Handle users.
    const users: User[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            users.push(...pg.users);

            if (!pg.nextUser && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2 items-center">
                    <h3>Search</h3>
                    <input
                        className="form-input p-2"
                        value={undefined}
                        onChange={(e) => {
                            e.preventDefault();

                            const val = e.currentTarget.value;

                            setSearch(val);
                        }}
                    />
                </div>
            </div>
            {grid ? (
                <>
                    {requireItems || users.length > 0 ? (
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={loadMore}
                            loader={<Loader key="loader" />}
                            hasMore={requireItems}
                            className="user-browser-grid"
                        >
                            <>
                                {users.length > 0 ? (
                                    <>
                                        {users.map((user) => {
                                            return (
                                                <UserGridRow
                                                    key={`user-row-${user.id}`}
                                                    user={user}
                                                />
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p>No users found.</p>
                                )}
                            </>
                        </InfiniteScroll>
                    ) : (
                        <p>No users found!</p>
                    )}
                </>
            ) : (
                <>
                    {requireItems || users.length > 0 ? (
                        <InfiniteScroll
                            pageStart={0}
                            loadMore={loadMore}
                            loader={<Loader key="loader" />}
                            hasMore={requireItems}
                        >
                            <table className="user-browser-table">
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>URL</th>
                                        <th>Title</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {users.map((user) => {
                                            return (
                                                <UserTableRow
                                                    key={`user-row-${user.id}`}
                                                    user={user}
                                                />
                                            );
                                        })}
                                    </>
                                </tbody>
                            </table>
                        </InfiniteScroll>
                    ) : (
                        <p>No users found!</p>
                    )}
                </>
            )}
        </>
    );
}

export default UserBrowser;