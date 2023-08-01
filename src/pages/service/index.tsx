import { useState } from "react";
import { type NextPage } from "next";
import Link from "next/link";

import { type Service } from "@prisma/client";

import ServiceRow from "@components/service/row";
import Wrapper from "@components/wrapper";

import { api } from "@utils/api";
import Loader from "@utils/loader";
import AddIcon from "@utils/icons/add";

import InfiniteScroll from "react-infinite-scroller";

const Page: NextPage = () => {
    // Filters
    const [mostPopular, setMostPopular] = useState(false);

    let sort = "id";
    const sortDir = "desc";

    if (mostPopular)
        sort = "views";

    const [requireItems, setRequireItems] = useState(true);

    const limit = 10;
    const { data, fetchNextPage } = api.service.getAll.useInfiniteQuery({
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

    const items: Service[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            if (!pg.nextCur && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <Wrapper>
            <div className="content">
                <h1>Services</h1>
                <div className="p-6 flex justify-between">
                    <Link href="#" className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")} onClick={(e) => {
                        e.preventDefault();

                        if (mostPopular)
                            setMostPopular(false);
                        else
                            setMostPopular(true);
                    }}>Most Popular</Link>
                    <Link href="/service/new" className="button button-primary flex">
                        <AddIcon 
                            classes={["w-6", "h-6", "fill-none"]}
                        />
                        <span className="ml-2">New Service</span>
                    </Link>
                </div>
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
                                {items.map((service: Service) => {
                                    return (
                                        <ServiceRow
                                            key={"service-" + service.id.toString()}
                                            service={service}
                                        />
                                    )
                                })}
                            </>
                        )}
                    </>
                </InfiniteScroll>
            </div>
        </Wrapper>
    );
}

export default Page;