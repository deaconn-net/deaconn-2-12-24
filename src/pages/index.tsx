import Link from "next/link";
import { type NextPage } from "next";

import { prisma } from "@server/db";
import { type Article, type Service, type User } from "@prisma/client";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import ArticleRow from "@components/blog/article/row";
import ServiceRow from "@components/service/row";
import PartnerRow from "@components/partner/row";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";
import UpdateBox from "@components/log/UpdateBox";
import GitLogBox from "@components/log/GitLogBox";
import DiscordWidget from "@components/DiscordWidget";
import UserRowGrid from "@components/user/row/grid";

const Page: NextPage<{
    articles: Article[],
    team: User[],
    services: Service[]
} & GlobalPropsType> = ({
    articles,
    team,
    services,
    footerServices,
    footerPartners
}) => {
    const discordServerId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID || undefined;

    const githubOrgUrl = process.env.NEXT_PUBLIC_GITHUB_ORG_URL || undefined;
    const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || undefined;

    return (
        <>
            <Meta
                title="Home - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="flex justify-center">
                    <UpdateBox />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-12">
                    <div className="content-col-large">
                        <div className="content-item2">
                            <div>
                                <h1>Who Are We?</h1>
                            </div>
                            <div>
                                <p>
                                    <span className="font-bold">Deaconn</span> is a software developer which produces products and services in various areas within technology.
                                </p>
                            </div>
                        </div>
                        <div className="content-item2">
                            <div>
                                <h1>Have A Request?</h1>
                            </div>
                            <div>
                                <p>We are a freelancing business and accept requests.</p>
                                <p><span className="font-bold">Note</span> - We cannot guarantee that we will accept every request. Once you submit a request, we will be able to communicate back and forth on payment, time frame, and more.</p>
                                <div className="flex py-6">
                                    <Link href="/request/new" className="button">New Request</Link>
                                </div>
                            </div>
                        </div>
                        <div className="content-item2">
                            <div>
                                <h1>Git Log</h1>
                            </div>
                            <div className="!p-0">
                                <GitLogBox />
                            </div>
                        </div>
                        <div className="content-item2">
                            <div>
                                <h1>Open Source!</h1>
                            </div>
                            <div className="flex flex-col gap-4">
                                {githubOrgUrl && (
                                    <p>Our website is <span className="font-bold">open source</span> on our <Link href={githubOrgUrl} target="_blank">GitHub organization</Link>!</p>
                                )}
                                {githubRepoUrl && (
                                    <Link
                                        href={githubRepoUrl}
                                        target="_blank"
                                        className="button button-primary w-full sm:w-72"
                                    >Check It Out!</Link>
                                )}
                                
                            </div>
                        </div>
                    </div>
                    <div className="content-col-small">
                        {team.length > 0 && (
                            <div className="content-item2">
                                <div>
                                    <h1>Our Team</h1>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {team.map((user) => {
                                        return (
                                            <UserRowGrid
                                                key={"team-" + user.id}
                                                user={user}
                                                showInline={true}
                                                avatarWidth={50}
                                                avatarHeight={50}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {footerPartners && footerPartners.length > 0 && (
                            <div className="content-item2">
                                <div>
                                    <h1>Our Partners</h1>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {footerPartners?.map((partner) => {
                                        return (
                                            <PartnerRow
                                                key={"partner-" + partner.id.toString()}
                                                partner={partner}
                                                showInline={true}
                                                bannerWidth={undefined}
                                                bannerHeight={undefined}
                                                bannerClassName="partner-row-banner"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {discordServerId && (
                            <div className="content-item2">
                                <div>
                                    <h1>Our Discord Server!</h1>
                                </div>
                                <div className="flex justify-center">
                                    <DiscordWidget
                                        id={discordServerId}
                                        className="max-w-full w-full"
                                        width="auto"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="content-item mt-8">
                    <h1>Popular Services</h1>
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
                    <h1>Latest Articles</h1>
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