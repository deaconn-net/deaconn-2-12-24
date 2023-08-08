import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { type Service } from "@prisma/client";

import IconAndText from "@components/containers/icon_and_text";
import ServiceRow from "@components/service/row";

import { api } from "@utils/api";
import AddIcon from "@utils/icons/add";
import { has_role } from "@utils/user/auth";
import Loader from "@utils/loader";

import InfiniteScroll from "react-infinite-scroller";

const ServiceBrowser: React.FC<{
    categories?: number[]
}> = ({
    categories
}) => {
    // Retrieve session.
    const { data: session } = useSession();

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
        <div className="service-browser">
            <div className="service-browser-buttons w-full sm:w-auto">
                <Link
                    className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")}
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();

                        if (mostPopular)
                            setMostPopular(false);
                        else
                            setMostPopular(true);
                    }}
                >Most Popular</Link>
                {session && (has_role(session, "moderator") || has_role(session, "admin")) && (
                    <Link
                        className="button button-primary flex justify-center"
                        href="/service/new"
                    >
                        <IconAndText
                            icon={
                                <AddIcon 
                                    classes={["w-6", "h-6", "fill-none"]}
                                />
                            }
                            text={<>New Service</>}
                            inline={true}
                        />
                    </Link>
                )}

            </div>
            {data && services.length > 0 ? (
                <InfiniteScroll
                    pageStart={0}
                    loadMore={loadMore}
                    loader={<Loader key={"loader"} />}
                    hasMore={requireItems}
                    className={"service-browser-scroller"}
                >
                    {services.map((service: Service) => {
                        return (
                            <ServiceRow
                                key={"service-" + service.id.toString()}
                                service={service}
                                small={true}
                            />
                        )
                    })}
                </InfiniteScroll>        
            ) : (
                <p>No services found.</p>
            )}
        </div>
    );
}

export default ServiceBrowser;