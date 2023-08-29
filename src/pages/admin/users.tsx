import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import UserBrowser from "@components/user/Browser";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    authed: boolean
} & GlobalPropsType> = ({
    authed,

    footerServices,
    footerPartners
}) => {
    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <h2>Admin Panel</h2>
                    <AdminSettingsPanel view="users">
                        <div className="content-item">
                            <UserBrowser />
                        </div>
                    </AdminSettingsPanel>
                </div>
            ) : (
                <NoPermissions />
            )}
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Make sure we're authorized.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed
        }
    }
}

export default Page;