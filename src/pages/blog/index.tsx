import { NextPage } from "next";
import { api } from "~/utils/api";
import { Deaconn } from '../../components/main';

import InfiniteScroll from 'react-infinite-scroller';
import { Article } from "@prisma/client";
import { Loader } from "~/components/utils/loader";
import { useState } from "react";

const ArticleRow: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="p-12 bg-gray-500">
      <h3 className="text-white text-xl font-bold">{article.title}</h3>
      <p className="text-gray-100">{article.desc}</p>
    </div>
  )
}

const Content: React.FC = () => {
  const [requireItems, setRequireItems] = useState(true);

  const { data, fetchNextPage } = api.blog.getAll.useInfiniteQuery({
    limit: 2
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

      if (pg.items.length < 1)
        setRequireItems(false);
    });
  }

  return (
    <div className="content">
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        loader={<Loader />}
        hasMore={requireItems}
      >
        <>
          {data && (
            <>
              {items.map((article: Article) => {
                return (
                  <ArticleRow
                    key={"article-" + article.id}
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

const Page: NextPage = () => {
  return (
    <Deaconn 
      content={<Content />}
    />
  );
};
export default Page;