import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";

import { type Role, type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";
import UserForm from "@components/forms/user/general";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import ErrorBox from "@utils/error";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";

const Page: NextPage<{
    authed: boolean,
    user: User | null,
    roles: Role[]
}> = ({
    authed,
    user,
    roles
}) => {
    let errTitle: string | undefined = undefined;
    let errMsg: string | undefined = undefined;

    let sucTitle: string | undefined = undefined;
    let sucMsg: string | undefined = undefined;

    // Role name to add.
    const [roleName, setRoleName] = useState(roles?.[0]?.id ?? "");

    // Make sure we have permissions.
    if (!authed) {
        return (
            <Wrapper>
                <NoPermissions />
            </Wrapper>
        );
    }

    // Make sure the user is found.
    if (!user) {
        return (
            <Wrapper>
                <NotFound item="User" />
            </Wrapper>
        );
    }

    // Queries.
    const userRolesQuery = api.admin.getUserRoles.useQuery({
        userId: user.id
    });

    const userRoles = userRolesQuery.data;

    // Prepare mutations.
    const addRoleMut = api.admin.addUserRole.useMutation();
    const delRoleMut = api.admin.delUserRole.useMutation();

    // Handle errors and success messages.
    if (addRoleMut.isSuccess) {
        sucTitle = "Role Added!";
        sucMsg = "Role added successfully!";
    } 
    
    if (addRoleMut.isError) {
        errTitle = "Role Not Added";
        errMsg = "Role was not added successfully.";
    }

    if (delRoleMut.isSuccess) {
        sucTitle = "Role Deleted!";
        sucMsg = "Role was deleted successfully!";
    } 
    
    if (delRoleMut.isError) {
        errTitle = "Role Not Deleted";
        errMsg = "Role was not deleted successfully.";
    }

    return (
        <Wrapper>
            <SuccessBox
                title={sucTitle}
                msg={sucMsg}
            />
            <ErrorBox
                title={errTitle}
                msg={errMsg}
            />
            <div className="content-item">
                <AdminSettingsPanel view="users">
                    <div className="flex flex-col gap-2">
                        <div className="content-item">
                            <h1>General Form</h1>
                            <UserForm
                                user={user}
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="content-item">
                                <h1>Roles</h1>
                                <div className="flex flex-wrap gap-4">
                                    {userRoles?.map((role) => {
                                        return (
                                            <div key={`role-${role.roleId}`} className="p-6 rounded-md bg-cyan-900 flex flex-col gap-2">
                                                <h2 className="text-center">{role.roleId}</h2>
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
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="content-item w-full">
                                <h2>Add Role</h2>
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
                        </div>
                    </div>
                </AdminSettingsPanel>
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve user ID.
    const { params } = ctx;

    const userId = params?.user?.[0];

    let user: User | null = null;
    let roles: Role[] = [];

    if (userId) {
        user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        roles = await prisma.role.findMany();
    }

    return {
        props: {
            authed: authed,
            user: JSON.parse(JSON.stringify(user)),
            roles: roles
        }
    }
}

export default Page;