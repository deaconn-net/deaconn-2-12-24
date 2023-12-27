import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Category } from "@prisma/client"
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";

import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";
import CategoryForm from "@components/forms/category/New";

import { HasRole } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    category,
    categories,

    footerServices,
    footerPartners
} : {
    category?: Category
    categories: CategoryWithChildren[]
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = HasRole(session, "ADMIN");

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <h2>Admin Panel</h2>
                {(authed && category) ? (
                    <AdminSettingsPanel view="categories">
                        <div className="content-item2">
                            <div>
                                <h2>Editing Category {category.name}</h2>
                            </div>
                            <div>
                                <CategoryForm
                                    category={category}
                                    categories={categories}
                                />
                            </div>
                        </div>
                    </AdminSettingsPanel>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Category" />
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

    // Check if we have permissions.
    const authed = HasRole(session, "ADMIN");

    // Retrieve role we're editing.
    const { params } = ctx;

    const categoryId = params?.id?.toString();

    // Initialize category and categories.
    let category: Category | null = null;
    let categories: CategoryWithChildren[] = [];

    // If we're authenticated and have a category ID, retrieve our categories.
    if (authed && categoryId) {
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

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            category: category,
            categories: categories
        }
    };
}