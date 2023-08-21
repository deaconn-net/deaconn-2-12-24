import { signOut } from "next-auth/react";

import TabMenuWithData from "@components/tabs/menu_with_data";
import Tabs, { type TabItemType } from "@components/tabs/tabs";

const SettingsPanel: React.FC<{
    view?: string,
    children: React.ReactNode
}> = ({
    view = "general",
    children
}) => {
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
            data={<>{children}</>}
        />
    );
}

export default SettingsPanel;