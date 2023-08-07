import Link from "next/link";

import TabMenuWithData from "@components/tabs/tab_menu_with_data";
import Tabs, { TabItemType } from "@components/tabs/tabs";

const AdminSettingsPanel: React.FC<{
    view: string,
    children: React.ReactNode
}> = ({
    view,
    children
}) => {
    // Compile tabs.
    const tabs: TabItemType[] = [
        {
            url: "/admin",
            text: <>General</>,
            active: view == "general"
        },
        {
            url: "/admin/roles",
            text: <>Roles</>,
            active: view == "roles"
        },
        {
            url: "/admin/categories",
            text: <>Categories</>,
            active: view == "categories"
        },
        {
            url: "/admin/users",
            text: <>Users</>,
            active: view == "users"
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
                    {children}
                </>
            }
        />
    );
}

export default AdminSettingsPanel;