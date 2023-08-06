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
    view?: string,
    
    user?: User,
    experience?: UserExperience,
    skill?: UserSkill,
    project?: UserProject
}> = ({
    view = "general",

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
                            className={`tab-link ${view == "general" ? "tab-active" : ""}`}    
                        >
                            <li>General</li>
                        </Link>
                        <Link
                            href="/user/profile/experiences"
                            className={`tab-link ${view == "experiences" ? "tab-active" : ""}`}
                        >
                            <li>Experiences</li>
                        </Link>
                        <Link
                            href="/user/profile/skills"
                            className={`tab-link ${view == "skills" ? "tab-active" : ""}`}
                        >
                            <li>Skills</li>
                        </Link>
                        <Link
                            href="/user/profile/projects"
                            className={`tab-link ${view == "projects" ? "tab-active" : ""}`}
                        >
                            <li>Projects</li>
                        </Link>
                    </ul>
                </div>
                <div className="grow p-6 bg-gray-800 rounded-sm flex flex-col gap-4">
                    {view == "general" && (
                        <div className="content-item">
                            <h2>General</h2>
                            <GeneralForm 
                                user={user}
                            />
                        </div>
                    )}
                    {view == "experiences" && (
                        <>
                            <div className="content-item">
                                <h2>Add Experience</h2>
                                <ExperienceForm
                                    experience={experience}
                                />
                            </div>
                            <div className="content-item">
                                <h2>Existing Experiences</h2>
                                {!experience && (
                                    <ExperienceBrowser
                                        userId={session?.user?.id}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {view == "skills" && (
                        <>
                            <div className="content-item">
                                <h2>Add Skill</h2>
                                <SkillForm
                                    skill={skill}
                                />
                            </div>
                            <div className="content-item">
                                <h2>Existing Skills</h2>
                                {!skill && (
                                    <SkillBrowser
                                        userId={session?.user?.id}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {view == "projects" && (
                        <>
                            <div className="content-item">
                                <h2>Add Project</h2>
                                <ProjectForm
                                    project={project}
                                />
                            </div>
                            <div className="content-item">
                                <h2>Existing Projects</h2>
                                {!project && (
                                    <ProjectBrowser
                                        userId={session?.user?.id}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default SettingsPanel;