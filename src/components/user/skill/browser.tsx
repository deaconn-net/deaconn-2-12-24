import { useState } from "react";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import Loader from "@utils/loader";

import Row from "@components/user/skill/row";

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

    const { data, fetchNextPage } = api.user.getAllSkills.useInfiniteQuery({
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

    const items: UserSkill[] = [];

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
                        {items.map((skill: UserSkill) => {
                            return (
                                <Row
                                    key={"skill-" + skill.id}
                                    skill={skill}
                                />
                            )
                        })}
                    </>
                )}
            </>
        </InfiniteScroll>
    );
}

export default Browser;