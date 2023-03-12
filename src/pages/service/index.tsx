import { GetServerSidePropsContext, NextPage } from "next";
import { api } from "~/utils/api";
import { Deaconn } from '../../components/main';

import InfiniteScroll from 'react-infinite-scroller';
import { Service } from "@prisma/client";
import { Loader } from "~/components/utils/loader";
import { useState } from "react";

import { ServiceRow } from "~/components/service/row";
import { Meta } from "~/components/meta";
import Link from "next/link";

const Content: React.FC<{ limit?: number, cdn: string }> = ({ limit = 10, cdn }) => {
    // Filters
    const [mostPopular, setMostPopular] = useState(false);

    let sort = "id";
    let sortDir = "desc";

    if (mostPopular)
        sort = "views";

    const [requireItems, setRequireItems] = useState(true);

    const { data, fetchNextPage } = api.service.getAll.useInfiniteQuery({
        limit: limit,

        sort: sort,
        sortDir: sortDir
    },
    {
        getNextPageParam: (lastPage) => lastPage.nextCur,
    });

    const loadMore = (page: number) => {
        fetchNextPage();
    }

    const items: Service[] = [];

    if (data) {
        data.pages.forEach((pg) => {
            items.push(...pg.items);

            if (pg.items.length < limit && requireItems)
                setRequireItems(false);
        });
    }

    return (
        <div className="content">
            <h1 className="content-title">Services</h1>
            <div className="p-6 flex justify-between">
                <Link href="#" className={"button" + ((mostPopular) ? " !bg-cyan-600" : "")} onClick={(e) => {
                    e.preventDefault();

                    if (mostPopular)
                        setMostPopular(false);
                    else
                        setMostPopular(true);
                }}>Most Popular</Link>
                <Link href="/service/new" className="button button-secondary flex">
                    <span><svg className="w-6 h-6 fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path opacity="0.1" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="fill-white" /><path d="M9 12H15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9L12 15" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="stroke-white" strokeWidth="2" /></svg></span>
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
                                        key={"service-" + service.id}
                                        cdn={cdn}
                                        service={service}
                                    />
                                )
                            })}
                        </>
                    )}
                </>
            </InfiniteScroll>
        </div>
    )
}

const Page: NextPage<{ cdn: string }> = ({ cdn }) => {
    const meta: Meta = {
        title: "Services - Deaconn",
        desc: "All services including open-source!"
    };

    return (
        <Deaconn
            meta={meta}
            content={<Content
                cdn={cdn}
            />}
        />
    );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let cdn = "";

    if (process.env.CDN_URL)
        cdn = process.env.CDN_URL;

    return { props: { cdn: cdn } };
}

export default Page;