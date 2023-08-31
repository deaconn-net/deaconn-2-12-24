import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";
import { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Role, type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";
import UserForm from "@components/forms/user/General";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
const Page: NextPage<{
    authed: boolean,
    user?: User,
    roles: Role[]
} & GlobalPropsType> = ({
    authed,
    user,
    roles,

    footerServices,
    footerPartners
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Role name to add.
    const [roleName, setRoleName] = useState(roles?.[0]?.id ?? "");

    // Queries.
    const userRolesQuery = api.admin.getUserRoles.useQuery({
        userId: user?.id ?? "INVALID"
    });

    const userRoles = userRolesQuery.data;

    // Prepare mutations.
    const addRoleMut = api.admin.addUserRole.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Role Not Added");
                errorCtx.setMsg("Role was not added successfully.");
                
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Role Added!");
                successCtx.setMsg("Role added successfully!");

                ScrollToTop();
            }
        }
    });

    const delRoleMut = api.admin.delUserRole.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Role Not Deleted");
                errorCtx.setMsg("Role was not deleted successfully.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Role Deleted!");
                successCtx.setMsg("Role was deleted successfully!");

                ScrollToTop();
            }
        }
    });

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <h2>Admin Panel</h2>
                {(authed && user) ? (
                    <AdminSettingsPanel view="users">
                        <div className="content-item2">
                            <div>
                                <h2>General Form</h2>
                            </div>
                            <div>
                                <UserForm
                                    user={user}
                                />
                            </div>
                        </div>
                        {userRoles && userRoles.length > 0 && (
                            <div className="content-item">
                                <h2>Existing Roles</h2>
                                <div className="flex flex-wrap gap-4 h-full">
                                    {userRoles?.map((role) => {
                                        return (
                                            <div key={`role-${role.roleId}`} className="content-item2">
                                                <div>
                                                    <h2>{role.roleId}</h2>
                                                </div>
                                                <div>
                                                    <button
                                                        className="button button-danger p-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            const yes = confirm("Are you sure you want to remove this role?");

                                                            if (yes) {
                                                                delRoleMut.mutate({
                                                                    userId: user.id,
                                                                    role: role.roleId
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
                        )}

                        <div className="content-item2">
                            <div>
                                <h2>Add Role</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    className="form-input w-72 p-2"
                                    onChange={(e) => {
                                        setRoleName(e.currentTarget.value);
                                    }}
                                >
                                    {roles.map((role) => {
                                        return (
                                            <option
                                                key={`add-role-${role.id}`}
                                                value={role.id}
                                            >
                                                {role.title} ({role.id})
                                            </option>
                                        );
                                    })}
                                </select>
                                <button
                                    className="button button-primary"
                                    onClick={(e) => {
                                        e.preventDefault();

                                        if (roleName.length > 0) {
                                            addRoleMut.mutate({
                                                userId: user.id,
                                                role: roleName
                                            });
                                        }

                                        ScrollToTop();
                                    }}
                                >Add!</button>
                            </div>
                        </div>
                    </AdminSettingsPanel>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="User" />
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

    // Check if we're authenticated.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve user ID.
    const { params } = ctx;

    const userId = params?.id?.toString();

    // Initialize user and roles.
    let user: User | null = null;
    let roles: Role[] = [];

    // If we're authenticated and have a user ID, retrieve user and roles.
    if (authed && userId) {
        user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        roles = await prisma.role.findMany();
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            user: JSON.parse(JSON.stringify(user)),
            roles: roles
        }
    }
}

export default Page;