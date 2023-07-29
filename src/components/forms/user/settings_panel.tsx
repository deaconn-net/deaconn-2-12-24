import { useSession } from "next-auth/react";
import Link from "next/link";

import { type UserExperience, type User, type UserSkill, type UserProject } from "@prisma/client";

import ExperienceBrowser from "@components/user/experience/browser";
import ProjectBrowser from "@components/user/project/browser";
import SkillBrowser from "@components/user/skill/browser";

import GeneralForm from "@components/forms/user/general";
import ExperienceForm from "@components/forms/user/experience";
import ProjectForm from "@components/forms/user/project";
import SkillForm from "@components/forms/user/skill";

const SettingsPanel: React.FC<{
    current?: string,
    
    user?: User,
    experience?: UserExperience,
    skill?: UserSkill,
    project?: UserProject
}> = ({
    current = "general",

    user,
    experience,
    skill,
    project
}) => {
    const { data: session } = useSession();

    return (
        <>
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
                        <GeneralForm 
                            user={user}
                        />
                    )}
                    {current == "experiences" && (
                        <>
                            {!experience && (
                                <ExperienceBrowser
                                    userId={session?.user?.id}
                                />
                            )}

                            <ExperienceForm
                                experience={experience}
                            />
                        </>
                    )}
                    {current == "skills" && (
                        <>
                            {!skill && (
                                <SkillBrowser
                                    userId={session?.user?.id}
                                />
                            )}

                            <SkillForm
                                skill={skill}
                            />
                        </>
                    )}
                    {current == "projects" && (
                        <>
                            {!project && (
                                <ProjectBrowser
                                    userId={session?.user?.id}
                                />
                            )}

                            <ProjectForm
                                project={project}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default SettingsPanel;