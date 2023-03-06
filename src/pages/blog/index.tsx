import { GetServerSidePropsContext, NextPage } from "next";
import { api } from "~/utils/api";
import { Deaconn } from '../../components/main';

import InfiniteScroll from 'react-infinite-scroller';
import { Article } from "@prisma/client";
import { Loader } from "~/components/utils/loader";
import { useState } from "react";

import { ArticleRow } from "~/components/article/row";
import { Meta } from "~/components/meta";

const Content: React.FC<{ limit?: number, cdn: string }> = ({ limit=10, cdn }) => {
  const [requireItems, setRequireItems] = useState(true);

  const { data, fetchNextPage } = api.blog.getAll.useInfiniteQuery({
    limit: limit
  },
  {
    getNextPageParam: (lastPage) => lastPage.nextCur,
  });

  const loadMore = (page: number) => {
    fetchNextPage();
  }

  const items: Article[] = [];

  if (data) {
    data.pages.forEach((pg) => {
      items.push(...pg.items);

      if (pg.items.length < limit && requireItems)
        setRequireItems(false);
    });
  }

  return (
    <div className="content">
      <h1 className="content-title">Blog</h1>
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
              {items.map((article: Article) => {
                return (
                  <ArticleRow
                    key={"article-" + article.id}
                    cdn={cdn}
                    article={article}
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
    title: "Blog - Deaconn",
    desc: "All articles from Deaconn."
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