import Link from "next/link";

const AdminSettingsPanel: React.FC<{
    view: string,
    children: React.ReactNode
}> = ({
    view,
    children
}) => {
    return (
        <div className="flex flex-wrap gap-2">
            <div>
                <ul className="tab-container w-64">
                    <Link
                        href="/admin"
                        className={`tab-link ${view == "general" ? "tab-active" : ""}`}
                    >General</Link>
                    <Link
                        href="/admin/roles"
                        className={`tab-link ${view == "roles" ? "tab-active" : ""}`}
                    >Roles</Link>
                    <Link
                        href="/admin/users"
                        className={`tab-link ${view == "users" ? "tab-active" : ""}`}
                    >Users</Link>
                </ul>
            </div>
            <div className="grow p-6 bg-gray-800 rounded-sm flex flex-col gap-4">
                {children}
            </div>
        </div>
    );
}

export default AdminSettingsPanel;