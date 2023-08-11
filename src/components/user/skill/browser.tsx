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

        userId: userId,

        sort: sort,
        sortDir: sortDir
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const skills: UserSkill[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            skills.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            {data && skills.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                    className={"grid-view grid-view-center grid-view-lg"}
                >
                    <>
                        {skills.map((skill: UserSkill) => {
                            return (
                                <Row
                                    key={"skill-" + skill.id.toString()}
                                    skill={skill}
                                />
                            )
                        })}
                    </>
                </InfiniteScroll>
            ) : (
                <p>No skills found.</p>
            )}
        </>
    );
}

export default Browser;