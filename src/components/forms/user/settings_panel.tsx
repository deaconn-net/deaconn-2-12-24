import { useSession } from "next-auth/react";
import Link from "next/link";
import { ExperienceBrowser } from "~/components/user/experience/browser";
import { ProjectBrowser } from "~/components/user/project/browser";
import { SkillBrowser } from "~/components/user/skill/browser";
import { UserExperienceForm } from "./experience";
import { UserGeneralForm } from "./general";
import { UserProjectForm } from "./project";
import { UserSkillForm } from "./skill";

export const UserSettingsPanel: React.FC<{ current?: string, lookupId?: number }> = ({ current = "general", lookupId }) => {
    const { data: session } = useSession();

    return (
        <>
            {session && (
                <div className="flex flex-wrap">
                    <div className="w-full sm:w-1/12">
                        <ul className="list-none">
                            <Link href="/user/profile">
                                <li className={"profile-item" + ((current == "general") ? " !bg-cyan-800" : "")}>General</li>
                            </Link>
                            <Link href="/user/profile/experiences">
                                <li className={"profile-item" + ((current == "experiences") ? " !bg-cyan-800" : "")}>Experiences</li>
                            </Link>
                            <Link href="/user/profile/skills">
                                <li className={"profile-item" + ((current == "skills") ? " !bg-cyan-800" : "")}>Skills</li>
                            </Link>
                            <Link href="/user/profile/projects">
                                <li className={"profile-item" + ((current == "projects") ? " !bg-cyan-800" : "")}>Projects</li>
                            </Link>
                        </ul>
                    </div>

                    <div className="w-full sm:w-11/12">
                        {current == "general" && (
                            <UserGeneralForm />
                        )}
                        {current == "experiences" && (
                            <>
                                {!lookupId && (
                                    <ExperienceBrowser
                                        userId={session.user.id ?? null}
                                    />
                                )}

                                <UserExperienceForm
                                    lookupId={lookupId}
                                />
                            </>
                        )}
                        {current == "skills" && (
                            <>
                                {!lookupId && (
                                    <SkillBrowser
                                        userId={session.user.id ?? null}
                                    />
                                )}

                                <UserSkillForm
                                    lookupId={lookupId}
                                />
                            </>
                        )}
                        {current == "projects" && (
                            <>
                                {!lookupId && (
                                    <ProjectBrowser
                                        userId={session.user.id ?? null}
                                    />
                                )}

                                <UserProjectForm
                                    lookupId={lookupId}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}