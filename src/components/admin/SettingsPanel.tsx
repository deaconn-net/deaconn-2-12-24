import TabMenuWithData from "@components/tabs/MenuWithData";
import Tabs, { type TabItemType } from "@components/tabs/Tabs";

export default function AdminSettingsPanel({
    view,
    showBg,

    children
} : {
    view: string,
    showBg?: boolean,

    children: React.ReactNode
}) {
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
        },
        {
            url: "/admin/partners",
            text: <>Partners</>,
            active: view == "partners"
        }
    ];
    
    return (
        <TabMenuWithData
            data_background={showBg}
            menu={
                <Tabs
                    items={tabs}
                    className="sm:w-64"
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