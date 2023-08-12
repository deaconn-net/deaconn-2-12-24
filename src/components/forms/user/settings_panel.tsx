import { signOut, useSession } from "next-auth/react";

import { type UserExperience, type User, type UserSkill, type UserProject } from "@prisma/client";

import ExperienceBrowser from "@components/user/experience/browser";
import ProjectBrowser from "@components/user/project/browser";
import SkillBrowser from "@components/user/skill/browser";

import GeneralForm from "@components/forms/user/general";
import ExperienceForm from "@components/forms/user/experience";
import ProjectForm from "@components/forms/user/project";
import SkillForm from "@components/forms/user/skill";
import TabMenuWithData from "@components/tabs/tab_menu_with_data";
import Tabs, { type TabItemType } from "@components/tabs/tabs";

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
                                        small={true}
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
                                        small={true}
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
                                        small={true}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </>
            }
        />
    );
}

export default SettingsPanel;