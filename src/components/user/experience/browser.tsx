import { useState } from "react";

import { type UserExperienceWithUser } from "~/types/user/experience";

import UserExperienceRow from "@components/user/experience/row";
import Loader from "@components/loader";

import { api } from "@utils/api";

import InfiniteScroll from "react-infinite-scroller";

export default function UserExperienceBrowser ({
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

    const { data, fetchNextPage } = api.user.getAllExperiences.useInfiniteQuery({
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

    const experiences: UserExperienceWithUser[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            experiences.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <>
            {!data || experiences.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                >
                    <div className={`grid-view grid-view-center ${small  ? "grid-view-sm" : "grid-view-lg"}`}>
                        {experiences.map((experience) => {
                            return (
                                <UserExperienceRow
                                    key={`experience-${experience.id.toString()}`}
                                    experience={experience}
                                />
                            )
                        })}
                    </div>
                </InfiniteScroll>
            ) : (
                <p>No experiences found.</p>
            )}
        </>
    );
}