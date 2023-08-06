import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { type Role } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";
import UserBrowser from "@components/user/browser";
import RoleForm from "@components/forms/role/new";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import CategoryForm from "@components/forms/category/new";

type statsType = {
    articles: number
    articleComments: number

    services: number
    purchases: number

    requests: number
    requestComments: number

    partners: number

    roles: number

    users: number
    userExperiences: number
    userSkills: number
    userProjects: number

};

const Page: NextPage<{
    authed: boolean,
    view: string,
    stats?: statsType,
    roles?: Role[],
    categories?: CategoryWithChildren[],
}> = ({
    authed,
    view,
    stats,
    roles,
    categories
}) => {
    // Prepare mutations.
    const roleDeleteMut = api.admin.delRole.useMutation();
    const categoryDeleteMut = api.category.delete.useMutation();

    // Success and error management.
    let sucTitle: string | undefined = undefined;
    let sucMsg: string | undefined = undefined;

    let errTitle: string | undefined = undefined;
    let errMsg: string | undefined = undefined;

    if (roleDeleteMut.isError) {
        errTitle = "Role Not Deleted";
        errMsg = "Role not deleted successfully.";
    } else if (roleDeleteMut.isSuccess) {
        sucTitle = "Role Deleted!";
        sucMsg = "Role deleted successfully.";
    }

    if (categoryDeleteMut.isError) {
        errTitle = "Category Not Deleted";
        errMsg = "Category not deleted successfully.";
    } else if (categoryDeleteMut.isSuccess) {
        sucTitle = "Category Deleted!";
        sucMsg = "Category deleted successfully.";
    }

    return (
        <>
            <Wrapper
                successTitleOverride={sucTitle}
                successMsgOverride={sucMsg}
                errorTitleOverride={errTitle}
                errorMsgOverride={errMsg}
            >
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
                                                    <li><span className="font-bold">{stats.articles.toString()}</span> Total Articles</li>
                                                    <li><span className="font-bold">{stats.articleComments.toString()}</span> Total Article Comments</li>
                                                    <li><span className="font-bold">{stats.services.toString()}</span> Total Services</li>
                                                    <li><span className="font-bold">{stats.purchases.toString()}</span> Total Service Purchases</li>
                                                    <li><span className="font-bold">{stats.requests.toString()}</span> Total Requests</li>
                                                    <li><span className="font-bold">{stats.requestComments.toString()}</span> Total Request Comments</li>
                                                    <li><span className="font-bold">{stats.partners.toString()}</span> Total Partners</li>
                                                    <li><span className="font-bold">{stats.roles.toString()}</span> Total Roles</li>
                                                    <li><span className="font-bold">{stats.users.toString()}</span> Total Users</li>
                                                    <li><span className="font-bold">{stats.userExperiences.toString()}</span> Total User Experiences</li>
                                                    <li><span className="font-bold">{stats.userSkills.toString()}</span> Total User Skills</li>
                                                    <li><span className="font-bold">{stats.userProjects.toString()}</span> Total User Projects</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {view == "roles" && (
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
                            )}
                            {view == "categories" && (
                                <div className="flex flex-col gap-4">
                                <div className="content-item">
                                    <h2>Add Category</h2>
                                    <CategoryForm
                                        key={"category-add-form"}
                                        categories={categories ?? []}
                                    />
                                </div>
                                <div className="content-item">
                                    <h2>Existing Categories</h2>
                                        <div className="flex gap-4">
                                            {categories?.map((category) => {
                                                // Compile links.
                                                const editUrl = `/admin/category/edit/${category.id.toString()}`;

                                                return (
                                                    <div
                                                        key={`admin-categories-${category.id.toString()}`}
                                                        className="p-6 bg-cyan-900 flex flex-col gap-2 rounded-md"
                                                    >
                                                        <div className="flex gap-2 items-center">
                                                            <h2 className="text-center">{category.name}</h2>
                                                        </div>
                                                        <div className="grow">
                                                            {category.desc ? (
                                                                <ReactMarkdown className="markdown">
                                                                    {category.desc}
                                                                </ReactMarkdown>
                                                            ) : (
                                                                <p className="italic">No description available.</p>
                                                            )}
                                                        </div>
                                                        {category.children.length > 0 && (
                                                            <div className="content-item">
                                                                <h3>Children</h3>
                                                                <ul className="list-none flex flex-wrap gap-4">
                                                                    {category.children.map((categoryChild) => {
                                                                        const editUrlChild = `/admin/category/edit/${categoryChild.id.toString()}`;

                                                                        return (
                                                                            <div
                                                                                key={`admin-categories-${categoryChild.id.toString()}`}
                                                                                className="flex gap-2 items-center"
                                                                            >
                                                                                <Link
                                                                                    href={editUrlChild}
                                                                                >{categoryChild.name}</Link>
                                                                                <button
                                                                                    className="text-red-600 hover:text-red-500"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();

                                                                                        const yes = confirm("Are you sure you want to delete this category?");

                                                                                        if (yes) {
                                                                                            categoryDeleteMut.mutate({
                                                                                                id: categoryChild.id
                                                                                            });
                                                                                        }

                                                                                        ScrollToTop();
                                                                                    }}
                                                                                >X</button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div className="flex flex-wrap gap-2">
                                                            <Link
                                                                href={editUrl}
                                                                className="button button-primary"
                                                            >Edit</Link>
                                                            <button
                                                                className="button button-danger"
                                                                onClick={(e) => {
                                                                    e.preventDefault();

                                                                    const yes = confirm("Are you sure you want to delete this category?");

                                                                    if (yes) {
                                                                        categoryDeleteMut.mutate({
                                                                            id: category.id
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
                            )}
                            {view == "users" && (
                                <div className="content-item">
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

    if (!["general", "roles", "users", "categories"].includes(view))
        view = "general";

    // Retrieve roles if needed.
    let roles: Role[] | undefined = undefined;

    if (view == "roles")
        roles = await prisma.role.findMany();

    // Retrieve categories if needed.
    let categories: CategoryWithChildren[] | undefined = undefined;

    if (view == "categories") {
        categories = await prisma.category.findMany({
            where: {
                parent: null
            },
            include: {
                children: true
            }
        });
    }

    // Retrieve stats if needed.
    let stats: statsType | null = null;

    if (view == "general") {
        const articleCnt = await prisma.article.count();
        const articleCommentCnt = await prisma.articleComment.count();

        const serviceCnt = await prisma.service.count();
        const purchaseCnt = await prisma.purchase.count();

        const requestCnt = await prisma.request.count();
        const requestCommentCnt = await prisma.requestComment.count();

        const partnerCnt = await prisma.partner.count();

        const roleCnt = await prisma.role.count();

        const userCnt = await prisma.user.count();
        const userExperienceCnt = await prisma.userExperience.count();
        const userSkillCnt = await prisma.userSkill.count();
        const userProjectCnt = await prisma.userProject.count();

        stats = {
            articles: articleCnt,
            articleComments: articleCommentCnt,

            services: serviceCnt,
            purchases: purchaseCnt,

            requests: requestCnt,
            requestComments: requestCommentCnt,

            partners: partnerCnt,

            roles: roleCnt,

            users: userCnt,
            userExperiences: userExperienceCnt,
            userSkills: userSkillCnt,
            userProjects: userProjectCnt
        };
    }

    return {
        props: {
            authed: authed,
            view: view,
            stats,
            roles: roles ? JSON.parse(JSON.stringify(roles)) : null,
            categories: categories ?? null
        }
    }
}

export default Page;