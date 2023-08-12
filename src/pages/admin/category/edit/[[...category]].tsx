import { type GetServerSidePropsContext, type NextPage } from "next";
import { getSession } from "next-auth/react";

import { type Category } from "@prisma/client"
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";

import AdminSettingsPanel from "@components/admin/settingspanel";
import NoPermissions from "@components/errors/no_permissions";
import NotFound from "@components/errors/not_found";
import CategoryForm from "@components/forms/category/new";

import { has_role } from "@utils/user/auth";
import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    authed: boolean,
    category: Category | null,
    categories: CategoryWithChildren[]
} & GlobalPropsType> = ({
    authed,
    category,
    categories,

    footerServices,
    footerPartners
}) => {
    if (!authed) {
        return (
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <NoPermissions />
            </Wrapper>
        );
    }

    if (!category) {
        return (
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <NotFound item="Category" />
            </Wrapper>
        );
    }

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
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

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            category: category,
            categories: categories
        }
    };
}

export default Page;