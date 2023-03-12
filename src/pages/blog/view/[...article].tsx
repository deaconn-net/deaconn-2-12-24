import { Article, User } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { prisma } from "~/server/db";
import { Deaconn } from '../../../components/main';
import ReactMarkdown from 'react-markdown';
import { UserLink } from "~/components/user/link";

import { dateFormat, dateFormatOne } from "~/utils/date";

type ArticleType = Article & {
  user: User | null;
};

const Content: React.FC<{ article: ArticleType | null, cdn: string }> = ({ article, cdn }) => {
  const image = (article && article.banner) ? cdn + article.banner : "/images/blog/default.jpg";

  let createdAt: string | null = null;
  let updatedAt: string | null = null;

  if (article) {
      createdAt = dateFormat(article.createdAt, dateFormatOne);
      updatedAt = dateFormat(article.updatedAt, dateFormatOne);
  }

  return (
    <div className="content">
      {article ? (
        <>
          <div className="w-full flex justify-center">
            <img src={image} className="w-[67.5rem] h-[33.75rem] max-h-full border-2 border-solid border-cyan-900 rounded-t" alt="Banner" />
          </div>
          <h1 className="content-title">{article.title}</h1>
          <div className="w-full bg-cyan-900 p-6 rounded-sm">
            <div className="text-white text-sm italic pb-4">
              {article.user && (
                <p>Created By <span className="font-bold"><UserLink user={article.user} /></span></p>
              )}
              {createdAt && (
                <p>Created On <span className="font-bold">{createdAt}</span></p>
              )}
              {updatedAt && (
                <p>Updated On <span className="font-bold">{updatedAt}</span></p>
              )}
              
            </div>
            <ReactMarkdown
              className="text-gray-100 markdown"
            >{article.content}</ReactMarkdown>
          </div>
        </>
      ) : (
        <p className="text-white">Article not found.</p>
      )}
    </div>
  )
}

const Page: NextPage<{ article: ArticleType | null, cdn: string }> = ({ article, cdn }) => {
  return (
    <Deaconn 
      content={<Content
        cdn={cdn} 
        article={article}
      />}
    />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let article: ArticleType | null = null;
  
  const url = (ctx?.params?.article) ? ctx.params.article[0] ?? null : null;

  if (url) {
    article  = await prisma.article.findFirst({
      where: {
        url: url
      },
      include: {
        user: true
      }
    });
  }

  return { props: { article: (article) ? JSON.parse(JSON.stringify(article)) : null, cdn: process.env.CDN_URL ?? "" } };
}

export default Page;