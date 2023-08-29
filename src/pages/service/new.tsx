import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ServiceForm from '@components/forms/service/New';
import NoPermissions from "@components/error/NoPermissions";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    authed: boolean,
    categories: CategoryWithChildren[]
} & GlobalPropsType> = ({
    authed,
    categories,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title="New Service - Services - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {authed ? (
                        <>
                            <h1>Add Service</h1>
                            <ServiceForm
                                categories={categories}
                            />
                        </>
                    ) : (
                        <NoPermissions />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Make sure we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    // Intitialize categories.
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
    };
}

export default Page;