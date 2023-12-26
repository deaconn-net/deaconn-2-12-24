import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Role } from "@prisma/client"

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";
import RoleForm from "@components/forms/role/New";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    role,

    footerServices,
    footerPartners
} : {
    role?: Role
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = has_role(session, "admin");

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <h2>Admin Panel</h2>
                {(authed && role) ? (
                    <AdminSettingsPanel view="roles">
                        <div className="content-item2">
                            <div>
                                <h2>Editing Role {role.id}</h2>
                            </div>
                            <div>
                                <RoleForm
                                    role={role}
                                />
                            </div>
                        </div>
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
    const session = await getServerAuthSession(ctx);

    // Check if we have permissions.
    const authed = has_role(session, "admin");

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
            role: role
        }
    };
}