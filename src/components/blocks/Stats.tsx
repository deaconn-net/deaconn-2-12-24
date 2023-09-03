export type Stats = {
    users?: number,
    articles?: number,
    services?: number,
    userExperiences?: number,
    userSkills?: number,
    userProjects?: number,

    totalCommits?: number,
    totalRepos?: number
}

export default function StatsBlock({
    stats
} : {
    stats?: Stats
}) {
    return (
        <div className="content-item2">
            <div>
                <h2>Stats</h2>
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
    );
}