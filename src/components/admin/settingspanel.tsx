import TabMenuWithData from "@components/tabs/menu_with_data";
import Tabs, { type TabItemType } from "@components/tabs/tabs";

export default function AdminSettingsPanel({
    view,
    children
} : {
    view: string,
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
        }
    ];
    
    return (
        <TabMenuWithData
            data_background={true}
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