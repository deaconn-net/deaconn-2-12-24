import { useState } from "react";

import { type UserSkillWithUser } from "~/types/user/skill";

import SkillRow from "@components/user/skill/Row";
import Loader from "@components/Loader";

import { api } from "@utils/Api";

import InfiniteScroll from "react-infinite-scroller";

export default function SkillBrowser ({
    sort,
    sortDir,
    userId,
    limit = 10,
    small = false
} : {
    sort?: string,
    sortDir?: string,
    userId?: string,
    limit?: number,
    small?: boolean
}) {
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

    const skills: UserSkillWithUser[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            skills.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            {!data || skills.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                >
                    <div className={`grid-view ${small  ? "grid-view-sm" : "grid-view-lg"}`}>
                        {skills.map((skill) => {
                            return (
                                <SkillRow
                                    key={"skill-" + skill.id.toString()}
                                    skill={skill}
                                />
                            )
                        })}
                    </div>
                </InfiniteScroll>
            ) : (
                <p>No skills found.</p>
            )}
        </>
    );
}