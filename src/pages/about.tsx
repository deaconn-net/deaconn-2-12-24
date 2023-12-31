import { type UserPublicTeam, UserPublicTeamSelect } from "~/types/user/user";
import StatsBlock, { type Stats } from "@components/blocks/Stats";

import { prisma } from "@server/db";

import Meta from "@components/Meta";
import Wrapper from "@components/Wrapper";

import DiscordServerBlock from "@components/blocks/DiscordServer";
import WhoAreWeBlock from "@components/blocks/WhoAreWe";
import MeetOurTeamBlock from "@components/blocks/MeetOurTeam";
import MeetOurPartnersBlock from "@components/blocks/MeetOurPartners";
import OpenSourceBlock from "@components/blocks/OpenSource";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    stats,
    team,

    footerServices,
    footerPartners
} : {
    stats?: Stats,
    team: UserPublicTeam[]
} & GlobalPropsType) {
    return (
        <>
            <Meta
                title="About - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="flex flex-wrap sm:flex-nowrap gap-4">
                    <div className="content-col-large">
                        <WhoAreWeBlock />
                        <MeetOurTeamBlock team={team} />
                        <MeetOurPartnersBlock partners={footerPartners} />
                        <OpenSourceBlock />
                    </div>
                    <div className="content-col-small">
                        <StatsBlock stats={stats} />
                        <DiscordServerBlock />
                    </div>
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    const stats: Stats = {};
    stats.users = await prisma.user.count();
    stats.articles = await prisma.article.count();
    stats.services = await prisma.service.count();
    stats.userExperiences = await prisma.userExperience.count();
    stats.userSkills = await prisma.userSkill.count();
    stats.userProjects = await prisma.userProject.count();

    // GitHub
    const commits = await prisma.githubStats.findFirst({
        where: {
            key: "commits"
        }
    });

    if (commits)
        stats.totalCommits = Number(commits.val);

    const repos = await prisma.githubStats.findFirst({
        where: {
            key: "repositories"
        }
    });

    if (repos)
        stats.totalRepos = Number(repos.val);

    const team = await prisma.user.findMany({
        select: UserPublicTeamSelect,
        where: {
            isTeam: true
        }
    });

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            stats: stats,
            team: JSON.parse(JSON.stringify(team))
        }
    }
}