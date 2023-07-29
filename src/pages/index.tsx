
import Link from "next/link";
import { GetServerSidePropsContext, type NextPage } from "next";

import { prisma } from "@server/db";
import { type Article, type Partner, type Service, type User } from "@prisma/client";

import Wrapper from "@components/wrapper";
import ArticleRow from "@components/article/row";
import UserRow from "@components/user/row";
import ServiceRow from "@components/service/row";
import PartnerRow from "@components/partner/row";

import GlobalProps from "@utils/global_props";

const Page: NextPage<{
    articles: Article[],
    team: User[],
    services: Service[],
    partners: Partner[]
}> = ({
    articles,
    team,
    services,
    partners
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    return (
        <Wrapper>
            <div className="content">
                <div className="flex flex-wrap">
                    <div className="content-col-large">
                        <div className="content-item">
                            <h1 className="content-title">Who Are We?</h1>
                            <p className="text-white"><span className="font-bold">Deaconn</span> is a software developer which produces products and services in various areas within technology.</p>
                        </div>
                        <div className="content-item">
                            <h1 className="content-title">Have A Request?</h1>
                            <p className="text-white">We are a freelancing business and accept requests.</p>
                            <p className="text-white"><span className="font-bold">Note</span> - We cannot guarantee that we will accept every request. Once you submit a request, we will be able to communicate back and forth on payment, time frame, and more.</p>
                            <div className="flex py-6">
                                <Link href="/request/new" className="button">New Request</Link>
                            </div>
                        </div>
                    </div>
                    <div className="content-col-small">
                        <div className="content-item">
                            <h1 className="content-title">Our Team</h1>
                            {team.map((user) => {
                                return (
                                    <UserRow
                                        key={"team-" + user.id}
                                        user={user}
                                    />
                                );
                            })}
                        </div>
                        <div className="content-item">
                            <h1 className="content-title">Partners</h1>
                            {partners.map((partner) => {
                                return (
                                    <PartnerRow
                                        key={"partner-" + partner.id}
                                        partner={partner}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="content-item">
                    <h1 className="content-title">Popular Services</h1>
                    <div className="grid-view grid-view-sm">
                        {services.map((service) => {
                            return (
                                <ServiceRow
                                    small={true}
                                    key={"service-" + service.id}
                                    service={service}
                                />
                            )
                        })}
                    </div>
                </div>
                <div className="content-item">
                    <h1 className="content-title">Latest Articles</h1>
                    <div className="grid-view grid-view-sm">
                        {articles.map((article) => {
                            return (
                                <ArticleRow
                                    small={true}
                                    key={"article-" + article.id}
                                    article={article}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
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
            //isTeam: true
        }
    });

    const services = await prisma.service.findMany({
        take: 10,
        orderBy: {
            downloads: "desc"
        }
    });

    // Assign props.
    const global = await GlobalProps();

    return {
        props: {
            ...global,
            articles: JSON.parse(JSON.stringify(articles)),
            team: JSON.parse(JSON.stringify(team)),
            services: JSON.parse(JSON.stringify(services))
        }
    };
}

export default Page;