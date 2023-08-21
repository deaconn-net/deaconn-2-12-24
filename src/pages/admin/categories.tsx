import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";

import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/error/no_permissions";
import CategoryForm from "@components/forms/category/new";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

import Markdown from "@components/markdown/markdown";

const Page: NextPage<{
    authed: boolean,
    categories?: CategoryWithChildren[],
} & GlobalPropsType> = ({
    authed,
    categories,

    footerServices,
    footerPartners
}) => {
    // Prepare mutations.
    const categoryDeleteMut = api.category.delete.useMutation();

    // Success and error management.
    let sucTitle: string | undefined = undefined;
    let sucMsg: string | undefined = undefined;

    let errTitle: string | undefined = undefined;
    let errMsg: string | undefined = undefined;

    if (categoryDeleteMut.isError) {
        errTitle = "Category Not Deleted";
        errMsg = "Category not deleted successfully.";
    } else if (categoryDeleteMut.isSuccess) {
        sucTitle = "Category Deleted!";
        sucMsg = "Category deleted successfully.";
    }

    return (
        <Wrapper
            successTitleOverride={sucTitle}
            successMsgOverride={sucMsg}
            errorTitleOverride={errTitle}
            errorMsgOverride={errMsg}

            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <AdminSettingsPanel view="categories">
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
                                <div className="flex flex-wrap gap-4">
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
                                                        <Markdown>
                                                            {category.desc}
                                                        </Markdown>
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

    // Make sure we're authorized.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Initialize categories.
    let categories: CategoryWithChildren[] | undefined = undefined;

    // If we're signed in, retrieve categories.
    if (authed) {
        categories = await prisma.category.findMany({
            where: {
                parent: null
            },
            include: {
                children: true
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            categories: categories ?? null
        }
    }
}

export default Page;