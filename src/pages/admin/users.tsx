import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";
import UserBrowser from "@components/user/browser";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

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
    const session = await getSession(ctx);

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