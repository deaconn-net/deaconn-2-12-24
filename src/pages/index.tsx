import Link from "next/link";
import { type NextPage } from "next";

import { prisma } from "@server/db";

import { type Article, type Service } from "@prisma/client";
import { type UserPublic, UserPublicSelect } from "~/types/user/user";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ArticleRow from "@components/blog/article/Row";
import ServiceRow from "@components/service/Row";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import OpenSourceBlock from "@components/blocks/OpenSource";
import DiscordServerBlock from "@components/blocks/DiscordServer";
import OurPartnersBlock from "@components/blocks/OurPartners";
import OurTeamBlock from "@components/blocks/OurTeam";
import GitLogBlock from "@components/blocks/GitLog";
import UpdateLogBlock from "@components/blocks/UpdateLog";
import HaveARequestBlock from "@components/blocks/HaveARequest";
import WhoAreWeBlock from "@components/blocks/WhoAreWe";

const Page: NextPage<{
    articles: Article[],
    team: UserPublic[],
    services: Service[]
} & GlobalPropsType> = ({
    articles,
    team,
    services,
    footerServices,
    footerPartners
}) => {
    

    return (
        <>
            <Meta
                title="Home - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="flex flex-wrap sm:flex-nowrap gap-12">
                    <div className="content-col-large">
                        <WhoAreWeBlock />
                        <HaveARequestBlock />
                        <UpdateLogBlock />
                        <GitLogBlock />
                    </div>
                    <div className="content-col-small">
                        <OurTeamBlock team={team} />
                        <OurPartnersBlock partners={footerPartners} />
                        <DiscordServerBlock />
                        <OpenSourceBlock />
                    </div>
                </div>
                <div className="content-item mt-8">
                    <h2>Popular Services</h2>
                    <div className="grid-view grid-view-sm">
                        {services.map((service) => {
                            return (
                                <ServiceRow
                                    key={"service-" + service.id.toString()}
                                    service={service}
                                />
                            )
                        })}
                    </div>
                </div>
                <div className="content-item">
                    <h2>Latest Articles</h2>
                    <div className="grid-view grid-view-sm">
                        {articles.map((article) => {
                            return (
                                <ArticleRow
                                    key={"article-" + article.id.toString()}
                                    article={article}
                                />
                            )
                        })}
                    </div>
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    // Retrieve articles, team members, and services.
    const articles = await prisma.article.findMany({
        take: 10,
        orderBy: {
            createdAt: "desc"
        }
    });

    const team = await prisma.user.findMany({
        select: UserPublicSelect,
        take: 10,
        where: {
            isTeam: true
        }
    });

    const services = await prisma.service.findMany({
        take: 10,
        orderBy: {
            totalDownloads: "desc"
        }
    });

    // Assign props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            articles: JSON.parse(JSON.stringify(articles)),
            team: JSON.parse(JSON.stringify(team)),
            services: JSON.parse(JSON.stringify(services))
        }
    };
}

export default Page;