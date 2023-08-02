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
            <div className="flex flex-wrap gap-2">
                <div>
                    <ul className="tab-container w-64">
                        <Link
                            href="/user/profile"
                            className={`tab-link ${current == "general" ? "tab-active" : ""}`}    
                        >
                            <li>General</li>
                        </Link>
                        <Link
                            href="/user/profile/experiences"
                            className={`tab-link ${current == "experiences" ? "tab-active" : ""}`}
                        >
                            <li>Experiences</li>
                        </Link>
                        <Link
                            href="/user/profile/skills"
                            className={`tab-link ${current == "skills" ? "tab-active" : ""}`}
                        >
                            <li>Skills</li>
                        </Link>
                        <Link
                            href="/user/profile/projects"
                            className={`tab-link ${current == "projects" ? "tab-active" : ""}`}
                        >
                            <li>Projects</li>
                        </Link>
                    </ul>
                </div>

                <div className="grow p-6 bg-gray-800 rounded-sm flex flex-col gap-4">
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