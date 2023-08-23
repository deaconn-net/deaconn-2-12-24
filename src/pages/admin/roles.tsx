import { useContext } from "react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Role } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";
import RoleForm from "@components/forms/role/new";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

import Markdown from "@components/markdown/markdown";

const Page: NextPage<{
    authed: boolean,
    roles?: Role[],
} & GlobalPropsType> = ({
    authed,
    roles,

    footerServices,
    footerPartners
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Prepare mutations.
    const roleDeleteMut = api.admin.delRole.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Role Not Deleted");
                errorCtx.setMsg("Role not deleted successfully.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Role Deleted!");
                successCtx.setMsg("Role deleted successfully.");

                ScrollToTop();
            }
        }
    });

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <h2>Admin Panel</h2>
                    <AdminSettingsPanel view="roles">
                        <div className="flex flex-col gap-4">
                            <div className="content-item">
                                <h2>Add Role</h2>
                                <RoleForm />
                            </div>
                            <div className="content-item">
                                <h2>Existing Roles</h2>
                                <div className="flex gap-4">
                                    {roles?.map((role) => {
                                        // Compile links.
                                        const editUrl = `/admin/role/edit/${role.id}`;

                                        return (
                                            <div
                                                key={`admin-roles-${role.id}`}
                                                className="p-6 bg-cyan-900 flex flex-col gap-2 rounded-md"
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <h2 className="text-center">{role.title}</h2>
                                                    <span className="text-sm">{` (${role.id})`}</span>
                                                </div>
                                                <div>
                                                    {role.desc ? (
                                                        <Markdown>
                                                            {role.desc}
                                                        </Markdown>
                                                    ) : (
                                                        <p className="italic">No description available.</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        href={editUrl}
                                                        className="button button-primary"
                                                    >Edit</Link>
                                                    <button
                                                        className="button button-danger"
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            const yes = confirm("Are you sure you want to delete this role?");

                                                            if (yes) {
                                                                roleDeleteMut.mutate({
                                                                    role: role.id
                                                                });
                                                            }

                                                            ScrollToTop();
                                                        }}
                                                    >Delete</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getSession(ctx);

    // Make sure we're authenticated.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Initialize roles.
    let roles: Role[] | undefined = undefined;

    // If we're signed in, retrieve roles.
    if (authed)
        roles = await prisma.role.findMany();

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            roles: roles ? JSON.parse(JSON.stringify(roles)) : null
        }
    }
}

export default Page;