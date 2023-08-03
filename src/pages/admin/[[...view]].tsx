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
import AdminSettingsPanel from "@components/admin/settingspanel";

type statsType = {
    articles?: number
    services?: number,
    users?: number
};

const Page: NextPage<{
    authed: boolean,
    view: string,
    roles?: Role[],
    stats?: statsType
}> = ({
    authed,
    view,
    roles,
    stats
}) => {
    const roleDeleteMut = api.admin.delRole.useMutation();

    return (
        <>
            <Wrapper>
                {authed ? (
                    <div className="content-item">
                        <AdminSettingsPanel view={view}>
                            {view == "general" && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {stats && (
                                            <div className="content-item">
                                                <h2>Stats</h2>
                                                <ul>
                                                    <li><span className="font-bold">{stats.articles}</span> Total Articles</li>
                                                    <li><span className="font-bold">{stats.services}</span> Total Services</li>
                                                    <li><span className="font-bold">{stats.users}</span> Total Users</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
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
                        </AdminSettingsPanel>
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

    // Retrieve roles if needed.
    let roles: Role[] | undefined = undefined;

    if (view == "roles")
        roles = await prisma.role.findMany();

    // Retrieve stats if needed.
    let stats: statsType | null = null;

    if (view == "general") {
        const articleCnt = await prisma.article.count();
        const serviceCnt = await prisma.service.count();
        const userCnt = await prisma.user.count();

        stats = {
            articles: articleCnt,
            services: serviceCnt,
            users: userCnt
        }
    }

    return {
        props: {
            authed: authed,
            view: view,
            roles: roles ? JSON.parse(JSON.stringify(roles)) : null,
            stats
        }
    }
}

export default Page;