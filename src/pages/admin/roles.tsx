import { useContext } from "react";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Role } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import RoleForm from "@components/forms/role/New";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import Markdown from "@components/markdown/Markdown";
import { useSession } from "next-auth/react";

export default function Page ({
    roles,

    footerServices,
    footerPartners
} : {
    roles?: Role[]
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = has_role(session, "admin");

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
                            <div className="content-item2">
                                <div>
                                    <h2>Add Role</h2>
                                </div>
                                <div>
                                    <RoleForm />
                                </div>
                            </div>
                            {roles && roles.length && (
                                <div className="content-item">
                                    <h2>Existing Roles</h2>
                                    <div className="flex gap-4">
                                        {roles.map((role) => {
                                            // Compile links.
                                            const editUrl = `/admin/role/edit/${role.id}`;

                                            return (
                                                <div
                                                    key={`admin-roles-${role.id}`}
                                                    className="content-item2"
                                                >
                                                    <div className="flex gap-2 items-center">
                                                        <h2 className="text-center">{role.title}</h2>
                                                        <span className="text-sm italic">{` (${role.id})`}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-4 h-full">
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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

    // Make sure we're authenticated.
    const authed = has_role(session, "admin");

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
            roles: roles ? JSON.parse(JSON.stringify(roles)) : null
        }
    }
}