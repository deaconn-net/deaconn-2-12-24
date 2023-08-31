import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Category } from "@prisma/client"
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";

import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";
import CategoryForm from "@components/forms/category/New";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    authed: boolean,
    category?: Category,
    categories: CategoryWithChildren[]
} & GlobalPropsType> = ({
    authed,
    category,
    categories,

    footerServices,
    footerPartners
}) => {
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
    let authed = false;

    if (session && has_role(session, "admin"))
        authed = true;

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
            authed: authed,
            category: category,
            categories: categories
        }
    };
}

export default Page;