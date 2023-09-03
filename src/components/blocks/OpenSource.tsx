import Link from "next/link";

export default function OpenSourceBlock () {
    const githubOrgUrl = process.env.NEXT_PUBLIC_GITHUB_ORG_URL || undefined;
    const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || undefined;

    const rootUserUrl = process.env.NEXT_PUBLIC_ROOT_USER_URL || "cdeacon";
    
    return (
        <div className="content-item2">
            <div>
                <h2>Open Source!</h2>
            </div>
            <div className="flex flex-col gap-4">
                {githubOrgUrl && (
                    <p>Our website is <span className="font-bold">open source</span> on our <Link href={githubOrgUrl} target="_blank">GitHub organization</Link>!</p>
                    
                )}
                <p>This website was built by <Link href={`/user/view/${rootUserUrl}`}>Christian Deacon</Link></p>
                {githubRepoUrl && (
                    <div className="flex justify-center">
                        <Link
                            href={githubRepoUrl}
                            target="_blank"
                            className="button w-full sm:w-auto"
                        >Check It Out!</Link>
                    </div>
                )}
            </div>
        </div>
    );
}