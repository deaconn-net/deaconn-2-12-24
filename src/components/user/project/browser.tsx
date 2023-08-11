import { useState } from "react";

import { type UserProject } from "@prisma/client";

import { api } from "@utils/api";
import Loader from "@utils/loader";

import Row from "@components/user/project/row";

import InfiniteScroll from "react-infinite-scroller";

const Browser: React.FC<{
    sort?: string,
    sortDir?: string,
    userId?: string,
    limit?: number
}> = ({
    sort,
    sortDir,
    userId,
    limit = 10
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

    const projects: UserProject[] = [];

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
                    className={"grid-view grid-view-center grid-view-lg"}
                >
                    <>
                        {projects.map((project: UserProject) => {
                            return (
                                <Row
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

export default Browser;