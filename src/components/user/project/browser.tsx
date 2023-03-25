import { UserProject } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";

import InfiniteScroll from 'react-infinite-scroller';
import { Loader } from "~/components/utils/loader";
import { ProjectRow } from "./row";

export const ProjectBrowser: React.FC<{ sort?: string, sortDir?: string, userId?: string, limit?: number }> = ({ sort, sortDir, userId, limit = 10 }) => {
    const [requireItems, setRequireItems] = useState(true);

    const { data, fetchNextPage } = api.user.getAllProjects.useInfiniteQuery({
        limit: limit,

        userId: userId ?? null,

        sort: sort,
        sortDir: sortDir
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        fetchNextPage();
    }

    const items: UserProject[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
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
                        {items.map((project: UserProject) => {
                            return (
                                <ProjectRow
                                    key={"project-" + project.id}
                                    project={project}
                                />
                            )
                        })}
                    </>
                )}
            </>
        </InfiniteScroll>
    );
}