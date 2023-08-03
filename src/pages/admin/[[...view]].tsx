import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { type Role } from "@prisma/client";

import { prisma } from "@server/db";

import NoPermissions from "@components/errors/no_permissions";
import UserBrowser from "@components/user/browser";
import Wrapper from "@components/wrapper";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import RoleForm from "@components/forms/role/new";

const Page: NextPage<{
    authed: boolean,
    view: string,
    roles?: Role[]
}> = ({
    authed,
    view,
    roles
}) => {
    const roleDeleteMut = api.admin.delRole.useMutation();

    return (
        <>
            <Wrapper>
                {authed ? (
                    <div className="content-item">
                        <div className="flex flex-wrap gap-2">
                            <div>
                                <ul className="tab-container w-64">
                                    <Link
                                        href="/admin"
                                        className={`tab-link ${view == "general" ? "tab-active" : ""}`}
                                    >General</Link>
                                    <Link
                                        href="/admin/roles"
                                        className={`tab-link ${view == "roles" ? "tab-active" : ""}`}
                                    >Roles</Link>
                                    <Link
                                        href="/admin/users"
                                        className={`tab-link ${view == "users" ? "tab-active" : ""}`}
                                    >Users</Link>
                                </ul>
                            </div>
                            <div className="grow p-6 bg-gray-800 rounded-sm flex flex-col gap-4">
                                {view == "general" && (
                                    <div className="flex flex-col gap-4">
                                        <p>Default admin page!</p>
                                    </div>
                                )}
                                {view == "roles" && (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <RoleForm />
                                        </div>
                                        <div className="flex gap-4">
                                            {roles?.map((role) => {
                                                // Compile links.
                                                const editUrl = `/admin/role/edit/${role.id}`;

                                                return (
                                                    <div
                                                        key={`admin-roles-${role.id}`}
                                                        className="p-6 bg-gray-900 flex flex-col gap-2 rounded-md"
                                                    >
                                                        <div className="flex gap-2 items-center">
                                                            <h2 className="text-center">{role.title}</h2>
                                                            <span className="text-sm">{` (${role.id})`}</span>
                                                        </div>
                                                        <div>
                                                            {role.desc ? (
                                                                <ReactMarkdown className="markdown">
                                                                    {role.desc}
                                                                </ReactMarkdown>
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
                                                                }}
                                                            >Delete</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {view == "users" && (
                                    <div className="flex flex-col gap-4">
                                        <UserBrowser />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <NoPermissions />
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Make sure we're authorized.
    const session = await getSession(ctx);

    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve view.
    const { params } = ctx;

    let view = params?.view?.[0] ?? "general";

    if (!["general", "roles", "users"].includes(view))
        view = "general";

    // Retrieve roles if we need to.
    let roles: Role[] | undefined = undefined;

    if (view == "roles") {
        roles = await prisma.role.findMany();
    }

    return {
        props: {
            authed: authed,
            view: view,
            roles: roles ? JSON.parse(JSON.stringify(roles)) : null
        }
    }
}

export default Page;