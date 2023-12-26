import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ArticleForm from '@components/forms/article/New';
import NoPermissions from "@components/error/NoPermissions";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    authed,
    categories,

    footerServices,
    footerPartners
} : {
    authed: boolean
    categories: CategoryWithChildren[]
} & GlobalPropsType) {
    return (
        <>
            <Meta
                title="New Article - Blog - Deaconn"
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {authed ? (
                    <div className="content-item2">
                        <div>
                            <h2>New Article</h2>
                        </div>
                        <div>
                            <ArticleForm
                                categories={categories}
                            />
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
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    // Initialize article and categories.
    let categories: CategoryWithChildren[] = [];

    // Retrieve categories if authenticated.
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
            categories: categories
        }
    }
}