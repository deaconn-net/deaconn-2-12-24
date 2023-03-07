import { GetServerSidePropsContext, NextPage } from "next";
import { api } from "~/utils/api";
import { Deaconn } from '../../components/main';

import InfiniteScroll from 'react-infinite-scroller';
import { Service } from "@prisma/client";
import { Loader } from "~/components/utils/loader";
import { useState } from "react";

import { ServiceRow } from "~/components/service/row";
import { Meta } from "~/components/meta";

const Content: React.FC<{ limit?: number, cdn: string }> = ({ limit=10, cdn }) => {
  const [requireItems, setRequireItems] = useState(true);

  const { data, fetchNextPage } = api.service.getAll.useInfiniteQuery({
    limit: limit
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