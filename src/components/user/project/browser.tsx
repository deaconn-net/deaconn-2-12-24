import { useState } from "react";

import { type UserProjectWithUser } from "~/types/user/project";

import Loader from "@components/loader";
import ProjectRow from "@components/user/project/row";

import { api } from "@utils/api";

import InfiniteScroll from "react-infinite-scroller";

const UserProjectBrowser: React.FC<{
    sort?: string,
    sortDir?: string,
    userId?: string,
    limit?: number,
    small?: boolean
}> = ({
    sort,
    sortDir,
    userId,
    limit = 10,
    small = false
}) => {
    const [requireItems, setRequireItems] = useState(true);

    const { data, fetchNextPage } = api.user.getAllProjects.useInfiniteQuery({
        limit: limit,

        userId: userId,

        sort: sort,
        sortDir: sortDir
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const projects: UserProjectWithUser[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            projects.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            {data && projects.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                    className={`grid-view grid-view-center ${small  ? "grid-view-sm" : "grid-view-lg"}`}
                >
                    <>
                        {projects.map((project) => {
                            return (
                                <ProjectRow
                                    key={`project-${project.id.toString()}`}
                                    project={project}
                                />
                            )
                        })}
                    </>
                </InfiniteScroll>
            ) : (
                <p>No projects found.</p>
            )}
        </>
    );
}

export default UserProjectBrowser;