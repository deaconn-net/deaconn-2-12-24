import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

type statsType = {
    articles: number
    articleComments: number

    services: number
    purchases: number

    requests: number
    requestReplies: number

    partners: number

    roles: number

    users: number
    userExperiences: number
    userSkills: number
    userProjects: number

};

const Page: NextPage<{
    authed: boolean,
    stats: statsType,
} & GlobalPropsType> = ({
    authed,
    stats,

    footerServices,
    footerPartners
}) => {
    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <AdminSettingsPanel view="general">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap justify-center gap-4">
                                {stats && (
                                    <div className="content-item">
                                        <h2>Stats</h2>
                                        <ul>
                                            <li><span className="font-bold">{stats.articles.toString()}</span> Total Articles</li>
                                            <li><span className="font-bold">{stats.articleComments.toString()}</span> Total Article Comments</li>
                                            <li><span className="font-bold">{stats.services.toString()}</span> Total Services</li>
                                            <li><span className="font-bold">{stats.purchases.toString()}</span> Total Service Purchases</li>
                                            <li><span className="font-bold">{stats.requests.toString()}</span> Total Requests</li>
                                            <li><span className="font-bold">{stats.requestReplies.toString()}</span> Total Request Replies</li>
                                            <li><span className="font-bold">{stats.partners.toString()}</span> Total Partners</li>
                                            <li><span className="font-bold">{stats.roles.toString()}</span> Total Roles</li>
                                            <li><span className="font-bold">{stats.users.toString()}</span> Total Users</li>
                                            <li><span className="font-bold">{stats.userExperiences.toString()}</span> Total User Experiences</li>
                                            <li><span className="font-bold">{stats.userSkills.toString()}</span> Total User Skills</li>
                                            <li><span className="font-bold">{stats.userProjects.toString()}</span> Total User Projects</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AdminSettingsPanel>
                </div>
            ) : (
                <NoPermissions />
            )}
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Make sure we're authorized.
    const session = await getSession(ctx);

    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve stats.
    const articleCnt = await prisma.article.count();
    const articleCommentCnt = await prisma.articleComment.count();

    const serviceCnt = await prisma.service.count();
    const purchaseCnt = await prisma.purchase.count();

    const requestCnt = await prisma.request.count();
    const requestRepliesCnt = await prisma.requestReply.count();

    const partnerCnt = await prisma.partner.count();

    const roleCnt = await prisma.role.count();

    const userCnt = await prisma.user.count();
    const userExperienceCnt = await prisma.userExperience.count();
    const userSkillCnt = await prisma.userSkill.count();
    const userProjectCnt = await prisma.userProject.count();

    const stats = {
        articles: articleCnt,
        articleComments: articleCommentCnt,

        services: serviceCnt,
        purchases: purchaseCnt,

        requests: requestCnt,
        requestReplies: requestRepliesCnt,

        partners: partnerCnt,

        roles: roleCnt,

        users: userCnt,
        userExperiences: userExperienceCnt,
        userSkills: userSkillCnt,
        userProjects: userProjectCnt
    };

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            stats
        }
    }
}

export default Page;