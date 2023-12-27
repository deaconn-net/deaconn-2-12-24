import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type Service } from "@prisma/client";

import IconAndText from "@components/containers/IconAndText";
import ServiceRow from "@components/service/Row";
import Loader from "@components/Loader";

import { api } from "@utils/Api";
import AddIcon from "@components/icons/Add";
import { HasRole } from "@utils/user/Auth";

import InfiniteScroll from "react-infinite-scroller";

export default function ServiceBrowser ({
    categories
} : {
    categories?: number[]
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Filters
    const [mostPopular, setMostPopular] = useState(false);

    let sort = "id";
    const sortDir = "desc";

    if (mostPopular)
        sort = "totalViews";

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.service.getAll.useInfiniteQuery({
        limit: limit,

        categories: categories,

        sort: sort,
        sortDir: sortDir
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = () => {
        void fetchNextPage();
    }

    const services: Service[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            services.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between flex-wrap gap-2 w-full sm:w-auto">
                <button
                    type="button"
                    className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")}
                    onClick={() => setMostPopular(!mostPopular)}
                >Most Popular</button>
                {(HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN")) && (
                    <Link
                        className="button button-primary flex justify-center"
                        href="/service/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon 
                                    className="w-6 h-6 fill-none"
                                />
                            }
                            text={<>New Service</>}
                            inline={true}
                        />
                    </Link>
                )}

            </div>
            {!data || services.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                >
                    <div className="grid-view grid-view-lg">
                        {services.map((service: Service) => {
                            return (
                                <ServiceRow
                                    key={"service-" + service.id.toString()}
                                    service={service}
                                />
                            )
                        })}
                    </div>
                </InfiniteScroll>        
            ) : (
                <p>No services found.</p>
            )}
        </div>
    );
}