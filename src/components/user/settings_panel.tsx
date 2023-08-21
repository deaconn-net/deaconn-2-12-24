import { signOut, useSession } from "next-auth/react";

import { type User } from "@prisma/client";
import { type UserProjectWithSourcesAndUser } from "~/types/user/project";
import { type UserExperienceWithUser } from "~/types/user/experience";
import { type UserSkillWithUser } from "~/types/user/skill";

import ExperienceBrowser from "@components/user/experience/browser";
import ProjectBrowser from "@components/user/project/browser";
import SkillBrowser from "@components/user/skill/browser";

import GeneralForm from "@components/forms/user/general";
import ExperienceForm from "@components/forms/user/experience";
import ProjectForm from "@components/forms/user/project";
import SkillForm from "@components/forms/user/skill";
import TabMenuWithData from "@components/tabs/menu_with_data";
import Tabs, { type TabItemType } from "@components/tabs/tabs";

const SettingsPanel: React.FC<{
    view?: string,
    
    user?: User,
    experience?: UserExperienceWithUser,
    skill?: UserSkillWithUser,
    project?: UserProjectWithSourcesAndUser
}> = ({
    view = "general",

    user,
    experience,
    skill,
    project
}) => {
    const { data: session } = useSession();

    // Compile tabs.
    const tabs: TabItemType[] = [
        {
            url: "/user/profile",
            text: <>General</>,
            active: view == "general"
        },
        {
            url: "/user/profile/experiences",
            text: <>Experiences</>,
            active: view == "experiences"
        },
        {
            url: "/user/profile/skills",
            text: <>Skills</>,
            active: view == "skills"
        },
        {
            url: "/user/profile/projects",
            text: <>Projects</>,
            active: view == "projects"
        },
        {
            url: "#",
            text: <>Sign Out</>,
            onClick: (e) => {
                e.preventDefault();

                void signOut();
            }
        }
    ];

    return (
        <TabMenuWithData
            data_background={true}
            menu={
                <Tabs
                    items={tabs}
                    classes={["sm:w-64"]}
                />
            }
            data={
                <>
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
                                <h2>{experience ? "Edit" : "Add"} Experience{experience && ` ${experience.title}`}</h2>
                                <ExperienceForm
                                    key={`experience-${experience?.id?.toString() ?? "new"}`}
                                    experience={experience}
                                />
                            </div>
                            {!experience && (
                                <div className="content-item">
                                    <h2>Existing Experiences</h2>
                                    <ExperienceBrowser
                                        userId={session?.user?.id}
                                        small={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {view == "skills" && (
                        <>
                            <div className="content-item">
                                <h2>{skill ? "Edit" : "Add"} Skill{skill && ` ${skill.title}`}</h2>
                                <SkillForm
                                    key={`skill-${skill?.id?.toString() ?? "new"}`}
                                    skill={skill}
                                />
                            </div>
                            {!skill && (
                                <div className="content-item">
                                    <h2>Existing Skills</h2>
                                    <SkillBrowser
                                        userId={session?.user?.id}
                                        small={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {view == "projects" && (
                        <>
                            <div className="content-item">
                                <h2>{project ? "Edit" : "Add"} Project{project && ` ${project.name}`}</h2>
                                <ProjectForm
                                    key={`project-${project?.id?.toString() ?? "new"}`}
                                    project={project}
                                />
                            </div>
                            {!project && (
                                <div className="content-item">
                                    <h2>Existing Projects</h2>
                                    <ProjectBrowser
                                        userId={session?.user?.id}
                                        small={true}
                                    />
                                </div>
                            )}

                        </>
                    )}
                </>
            }
        />
    );
}

export default SettingsPanel;