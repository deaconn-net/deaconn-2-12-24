import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import UserBrowser from "@components/user/Browser";

import { HasRole } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    footerServices,
    footerPartners
} : GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = HasRole(session, "ADMIN");

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <h2>Admin Panel</h2>
                    <AdminSettingsPanel view="users">
                        <div className="content-item2">
                            <div>
                                <h2>All Users</h2>
                            </div>
                            <div>
                                <UserBrowser />
                            </div>
                        </div>
                    </AdminSettingsPanel>
                </div>
            ) : (
                <NoPermissions />
            )}
        </Wrapper>
    );
}

export async function getServerSideProps() {
    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps
        }
    }
}