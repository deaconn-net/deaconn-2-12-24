import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Role } from "@prisma/client"

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";
import RoleForm from "@components/forms/role/new";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Edit: NextPage<{
    authed: boolean,
    role: Role | null
} & GlobalPropsType> = ({
    authed,
    role,

    footerServices,
    footerPartners
}) => {
    if (!authed) {
        return (
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <NoPermissions />
            </Wrapper>
        );
    }

    if (!role) {
        return (
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <NotFound item="Role" />
            </Wrapper>
        );
    }

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <AdminSettingsPanel view="roles">
                    <RoleForm
                        role={role}
                    />
                </AdminSettingsPanel>
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getSession(ctx);

    // Check if we have permissions.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve role we're editing.
    const { params } = ctx;

    const roleId = params?.role?.[0];

    let role: Role | null = null;

    if (roleId) {
        role = await prisma.role.findFirst({
            where: {
                id: roleId
            }
        })
    }

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