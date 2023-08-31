import { type GetServerSidePropsContext, type NextPage } from "next";

import { type User } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import SkillBrowser from "@components/user/skill/Browser";
import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    user?: User
} & GlobalPropsType> = ({
    user,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Skills - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                breadcrumbs={[
                    ...(user ? [{
                        name: `Viewing ${user.name}`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}`
                    }] : []),
                    ...(user ? [{
                        name: `Skills`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/skills`
                    }] : [])
                ]}

                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {user ? (
                        <UserView
                            user={user}
                            view="skills"
                        >
                            <div className="content-item">
                                <h1>Skills</h1>
                                <SkillBrowser
                                    userId={user.id}
                                    small={true}
                                />
                            </div>
                        </UserView>
                    ) : (
                        <NotFound item="User" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve user ID.
    const { params } = ctx;

    const userId = params?.user?.toString();

    // Initialize user.
    let user: User | null = null;

    // if user ID is found, retrieve user.
    if (userId) {
        let lookup_url = true;

        if (userId[0] == "$")
            lookup_url = false;

        user = await prisma.user.findFirst({
            where: {
                ...(lookup_url && {
                    url: userId
                }),
                ...(!lookup_url && {
                    id: userId.substring(1)
                })
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            user: JSON.parse(JSON.stringify(user))
        }
    };
}


export default Page;