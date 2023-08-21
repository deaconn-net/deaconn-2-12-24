import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Role } from "@prisma/client"

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";
import NotFound from "@components/error/not_found";
import RoleForm from "@components/forms/role/new";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Edit: NextPage<{
    authed: boolean,
    role?: Role
} & GlobalPropsType> = ({
    authed,
    role,

    footerServices,
    footerPartners
}) => {
    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                {(authed && role) ? (
                    <AdminSettingsPanel view="roles">
                        <RoleForm
                            role={role}
                        />
                    </AdminSettingsPanel>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Role" />
                        )}
                    </>
                )}
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Check if we have permissions.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve role ID.
    const { params } = ctx;

    const roleId = params?.id?.toString();

    // Initialize role.
    let role: Role | null = null;

    // If we're authenticated and have a role ID, retrieve role.
    if (authed && roleId) {
        role = await prisma.role.findFirst({
            where: {
                id: roleId
            }
        })
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            role: role
        }
    };
}

export default Edit;