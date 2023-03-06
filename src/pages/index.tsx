import { Article, Service, User } from "@prisma/client";
import { GetServerSidePropsContext, type NextPage } from "next";
import { prisma } from "~/server/db";
import { Deaconn } from '../components/main';
import { ArticleRow } from "./blog";

const Content: React.FC<{ cdn: string, articles: Article[], team: User[], services: Service[]}> = ({ cdn, articles, team, services }) => {
  return (
    <div className="content">
      <div className="flex flex-wrap">
        <div className="content-col-large">
          <div className="content-item">
            <h1 className="content-title">Popular Services</h1>
            <div>
              <p>Our services!</p>
            </div>
          </div>
          <div className="content-item">
            <h1 className="content-title">Have A Request?</h1>
          </div>
          <div className="content-item">
            <h1 className="content-title">Latest Articles</h1>
            <div className="grid-view grid-view-sm">
              {articles.map((article) => {
                return (
                  <ArticleRow
                    small={true}
                    key={"article-" + article.id}
                    cdn={cdn}
                    article={article}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="content-col-small">
          <div className="content-item">
            <h1 className="content-title">Our Team</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

const Page: NextPage<{ cdn: string, articles: Article[], team: User[], services: Service[]}> = ({ cdn, articles, team, services }) => {
  return (
    <Deaconn 
      content={<Content 
        cdn={cdn}
        articles={articles}
        team={team}
        services={services}
      />}
    />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let cdn = "";

  if (process.env.CDN_URL)
    cdn = process.env.CDN_URL;

  // Retrieve articles, team members, and services.
  const articles = await prisma.article.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc"
    }
  });

  const team = await prisma.user.findMany({
    take: 10,
    where: {
      isTeam: true
    }
  });

  const services = await prisma.service.findMany({
    take: 10,
    orderBy: {
      downloads: "desc"
    }
  });

  return { props: { 
    cdn: cdn,
    articles: JSON.parse(JSON.stringify(articles)),
    team: JSON.parse(JSON.stringify(team)),
    services: JSON.parse(JSON.stringify(services))
  } };
}

export default Page;