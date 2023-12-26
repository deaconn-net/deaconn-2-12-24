import { useContext } from "react";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import CategoryForm from "@components/forms/category/New";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import Markdown from "@components/markdown/Markdown";

export default function Page ({
    authed,
    categories,

    footerServices,
    footerPartners
} : {
    authed: boolean
    categories?: CategoryWithChildren[]
} & GlobalPropsType) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Prepare mutations.
    const categoryDeleteMut = api.category.delete.useMutation({
        onError: (opts) => {
            const { message } =  opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Category Not Deleted");
                errorCtx.setMsg("Category not deleted successfully.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Category Deleted!");
                successCtx.setMsg("Category deleted successfully.");

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
                    <AdminSettingsPanel view="categories">
                        <div className="flex flex-col gap-4">
                            <div className="content-item2">
                                <div>
                                    <h2>Add Category</h2>
                                </div>
                                <div>
                                    <CategoryForm
                                        key={"category-add-form"}
                                        categories={categories ?? []}
                                    />
                                </div>
                            </div>
                            {categories && categories.length > 0 && (
                                <div className="content-item">
                                    <h2>Existing Categories</h2>
                                    <div className="flex flex-wrap gap-4">
                                        {categories?.map((category) => {
                                            // Compile links.
                                            const editUrl = `/admin/category/edit/${category.id.toString()}`;

                                            return (
                                                <div
                                                    key={`admin-categories-${category.id.toString()}`}
                                                    className="content-item2"
                                                >
                                                    <div>
                                                        <h2>{category.name}</h2>
                                                    </div>
                                                    <div className="flex flex-col gap-4 h-full">
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