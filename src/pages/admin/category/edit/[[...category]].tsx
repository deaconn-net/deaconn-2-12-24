import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Category } from "@prisma/client"
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";

import { has_role } from "@utils/user/auth";
import CategoryForm from "@components/forms/category/new";

const Page: NextPage<{
    authed: boolean,
    category: Category | null,
    categories: CategoryWithChildren[]
}> = ({
    authed,
    category,
    categories
}) => {
    if (!authed) {
        return (
            <Wrapper>
                <NoPermissions />
            </Wrapper>
        );
    }

    if (!category) {
        return (
            <Wrapper>
                <NotFound item="Category" />
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <div className="content-item">
                <AdminSettingsPanel view="categories">
                    <CategoryForm
                        category={category}
                        categories={categories}
                    />
                </AdminSettingsPanel>
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getSession(ctx);

    // Check if we have permissions.
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

    // Retrieve role we're editing.
    const { params } = ctx;

    const categoryId = params?.category?.[0];

    let category: Category | null = null;
    let categories: CategoryWithChildren[] = [];

    if (categoryId) {
        category = await prisma.category.findFirst({
            where: {
                id: Number(categoryId)
            }
        });

        categories = await prisma.category.findMany({
            where: {
                parent: null
            },
            include: {
                children: true
            }
        });
    }

    return {
        props: {
            authed: authed,
            category: category,
            categories: categories
        }
    };
}

export default Page;