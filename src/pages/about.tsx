import { type NextPage } from "next";

import Meta from "@components/Meta";
import Wrapper from "@components/Wrapper";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { prisma } from "@server/db";

type stats = {
    users?: number,
    articles?: number,
    services?: number,
    userExperiences?: number,
    userSkills?: number,
    userProjects?: number,

    totalCommits?: number,
    totalRepos?: number
}

const Page: NextPage<{
    stats?: stats
} & GlobalPropsType> = ({
    stats,

    footerServices,
    footerPartners
}) => {
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
                    <div className="w-2/3">
                        <div className="content-item2">
                            <div>
                                <h1>About Us</h1>
                            </div>
                            <div>
                                <p>This is the start of our about us page!</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="content-item2">
                            <div>
                                <h1>Stats</h1>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2>Website</h2>
                                    <ul className="px-6">
                                        <li>{stats?.users?.toString() ?? "N/A"} <span className="font-bold">Total Users</span></li>
                                        <li>{stats?.articles?.toString() ?? "N/A"} <span className="font-bold">Total Articles</span></li>
                                        <li>{stats?.services?.toString() ?? "N/A"} <span className="font-bold">Total Services</span></li>
                                        <li>{stats?.userExperiences?.toString() ?? "N/A"} <span className="font-bold">Total User Experiences</span></li>
                                        <li>{stats?.userSkills?.toString() ?? "N/A"} <span className="font-bold">Total User Skills</span></li>
                                        <li>{stats?.userProjects?.toString() ?? "N/A"} <span className="font-bold">Total User Projects</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h2>GitHub</h2>
                                    <ul className="px-6">
                                        <li>{stats?.totalCommits?.toString() ?? "N/A"} <span className="font-bold">Total Commits</span></li>
                                        <li>{stats?.totalRepos?.toString() ?? "N/A"} <span className="font-bold">Total Repositories</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps() {
    const stats: stats = {};
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

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            stats: stats
        }
    }
}

export default Page;