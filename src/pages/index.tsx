import { prisma } from "@server/db";

import { type Service } from "@prisma/client";
import { ArticleFrontSelect, type ArticleWithUser } from "~/types/blog/article";
import { UserPublicTeamSelect, type UserPublicTeam } from "~/types/user/user";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import OpenSourceBlock from "@components/blocks/OpenSource";
import DiscordServerBlock from "@components/blocks/DiscordServer";
import OurPartnersBlock from "@components/blocks/OurPartners";
import OurTeamBlock from "@components/blocks/OurTeam";
import GitLogBlock from "@components/blocks/GitLog";
import UpdateLogBlock from "@components/blocks/UpdateLog";
import HaveARequestBlock from "@components/blocks/HaveARequest";
import WhoAreWeBlock from "@components/blocks/WhoAreWe";
import BlogCarousel from "@components/blog/Carousel";
import ServiceCarousel from "@components/service/Carousel";
import { ServiceFrontSelect } from "~/types/service";
import { SortByRole } from "@utils/user/Roles";

export default function Page ({
    articlesLatest,
    articlesPopular,
    team,
    services,
    footerServices,
    footerPartners
} : {
    articlesLatest: ArticleWithUser[]
    articlesPopular: ArticleWithUser[]
    team: UserPublicTeam[]
    services: Service[]
} & GlobalPropsType) {
    const teamSorted = SortByRole(team);

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
                        <OurTeamBlock team={teamSorted} />
                        <OurPartnersBlock partners={footerPartners} />
                        <DiscordServerBlock />
                        <OpenSourceBlock />
                    </div>
                </div>
                <div className="content-item mt-8">
                    <h2>Popular Services</h2>
                    <ServiceCarousel
                        services={services}
                        autoPlaySpeedMax={10000}
                        autoPlaySpeedMin={3000}
                    />
                </div>
                <div className="content-item">
                    <h2>Latest Articles</h2>
                    <BlogCarousel
                        articles={articlesLatest}
                        autoPlaySpeedMax={10000}
                        autoPlaySpeedMin={3000}
                    />
                </div>
                <div className="content-item">
                    <h2>Popular Articles</h2>
                    <BlogCarousel
                        articles={articlesPopular}
                        autoPlaySpeedMax={10000}
                        autoPlaySpeedMin={3000}
                    />
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    // Retrieve articles, team members, and services.
    const articlesLatest = await prisma.article.findMany({
        take: 10,
        select: ArticleFrontSelect,
        orderBy: {
            createdAt: "desc"
        }
    });

    const articlesPopular = await prisma.article.findMany({
        take: 10,
        select: ArticleFrontSelect,
        orderBy: {
            views: "desc"
        }
    });

    const team = await prisma.user.findMany({
        select: UserPublicTeamSelect,
        take: 10,
        where: {
            isTeam: true
        }
    });

    const services = await prisma.service.findMany({
        take: 10,
        select: ServiceFrontSelect,
        orderBy: {
            totalDownloads: "desc"
        }
    });

    // Assign props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            articlesLatest: JSON.parse(JSON.stringify(articlesLatest)),
            articlesPopular: JSON.parse(JSON.stringify(articlesPopular)),
            team: JSON.parse(JSON.stringify(team)),
            services: JSON.parse(JSON.stringify(services))
        }
    };
}