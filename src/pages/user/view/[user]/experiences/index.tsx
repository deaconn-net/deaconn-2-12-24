import { type GetServerSidePropsContext } from "next";

import { UserPublicSelect, type UserPublic } from "~/types/user/user";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import ExperienceBrowser from "@components/user/experience/Browser";
import NotFound from "@components/error/NotFound";
import UserView from "@components/user/View";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    user,

    footerServices,
    footerPartners
} : {
    user?: UserPublic
} & GlobalPropsType) {
    return (
        <>
            <Meta
                title={`Experiences - ${user?.name ?? "Not Found"} - Users - Deaconn`}
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Profiles"
                    },
                    ...(user ? [{
                        name: user.name ?? "User",
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}`
                    }] : []),
                    ...(user ? [{
                        name: `Experiences`,
                        url: `/user/view/${user.url ? user.url : `$${user.id}`}/experiences`
                    }] : [])
                ]}
    
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {user ? (
                    <UserView
                        user={user}
                        view="experiences"
                    >
                        <div className="content-item">
                            <h1>Experiences</h1>
                            <ExperienceBrowser
                                userId={user.id}
                                small={true}
                            />
                        </div>
                    </UserView>
                ) : (
                    <NotFound item="User" />
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve user ID or URL.
    const { params } = ctx;

    const userId = params?.user?.toString();

    // Initialize user.
    let user: UserPublic | null = null;

    // If user ID or URL is found, retrieve user.
    if (userId) {
        let lookupUrl = true;

        if (userId[0] == "$")
            lookupUrl = false;

        user = await prisma.user.findFirst({
            select: UserPublicSelect,
            where: {
                ...(lookupUrl && {
                    url: userId
                }),
                ...(!lookupUrl && {
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