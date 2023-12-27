import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import { useContext, useState } from "react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserRoles, type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";
import UserForm from "@components/forms/user/General";

import { api } from "@utils/Api";
import { HasRole } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    user,

    footerServices,
    footerPartners
} : {
    user?: User
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = HasRole(session, "ADMIN");

    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve available roles.
    const availRoles: UserRoles[] = ["ADMIN", "MODERATOR", "CONTRIBUTOR"]

    // If the user has roles, remove them from the available roles array.
    if (user) {
        user.roles.map((role) => {
            const idx = availRoles.findIndex(tmp => tmp == role)

            if (idx !== -1)
                availRoles.splice(idx, 1);
        })
    }

    // Role name to add.
    const [roleName, setRoleName] = useState(availRoles?.[0] ?? undefined);

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
                        {user.roles.length > 0 && (
                            <div className="content-item">
                                <h2>Existing Roles</h2>
                                <div className="flex flex-wrap gap-4 h-full">
                                    {user.roles.map((role, index) => {
                                        return (
                                            <div key={`role-${index.toString()}`} className="content-item2">
                                                <div>
                                                    <h2>{role}</h2>
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
                                                                    role: role
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
                                        const val = e.currentTarget.value;

                                        switch (val) {
                                            case "ADMIN":
                                                setRoleName("ADMIN");

                                                break;

                                            case "MODERATOR":
                                                setRoleName("MODERATOR");

                                                break;

                                            case "CONTRIBUTOR":
                                                setRoleName("CONTRIBUTOR");

                                                break;

                                            default:
                                                setRoleName(undefined);
                                        }
                                    }}
                                >
                                    {availRoles.map((role, index) => {
                                        return (
                                            <option
                                                key={`role-${index.toString()}`}
                                                value={role}
                                            >
                                                {role}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={() => {
                                        if (roleName) {
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
    const authed = HasRole(session, "ADMIN");

    // Retrieve user ID.
    const { params } = ctx;

    const userId = params?.id?.toString();

    // Initialize user and roles.
    let user: User | null = null;

    // If we're authenticated and have a user ID, retrieve user and roles.
    if (authed && userId) {
        user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user))
        }
    }
}